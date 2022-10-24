import { get_entity_from_coord, lookup_coords_from_side, lookup_coords_from_side_and_prof, put_entity_at_coord_and_also_adjust_flags } from "./board";
import { Board, PiecePhaseMove, PiecePhasePlayed, professionFullName, ResolvedGameState, unpromote, UnpromotedShogiProfession, isUnpromotedShogiProfession, is_promotable } from "./type"
import { columnsBetween, coordDiff, coordEq, Coordinate, displayCoord, ShogiColumnName, ShogiRowName } from "./coordinate"
import { Side, coordDiffSeenFrom, RightmostWhenSeenFrom, LeftmostWhenSeenFrom, opponentOf, is_within_nth_furthest_rows } from "./side";

/** 駒を打つ。手駒から将棋駒を盤上に移動させる。行きどころの無い位置に桂馬と香車を打ったらエラー。
 * 
 */
function parachute(old: ResolvedGameState, o: { side: Side, prof: UnpromotedShogiProfession, to: Coordinate }): PiecePhasePlayed {
    if (get_entity_from_coord(old.board, o.to)) {
        throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}打とのことですが、${displayCoord(o.to)}マスは既に埋まっています`);
    }
    if (o.prof === "桂") {
        if (is_within_nth_furthest_rows(2, o.side, o.to)) {
            throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}打とのことですが、行きどころのない桂馬は打てません`);
        }
    } else if (o.prof === "香") {
        if (is_within_nth_furthest_rows(1, o.side, o.to)) {
            throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}打とのことですが、行きどころのない香車は打てません`);
        }
    }
    const hand = old[o.side === "白" ? "hand_of_white" : "hand_of_black"];
    put_entity_at_coord_and_also_adjust_flags(old.board, o.to, { type: "しょ", side: o.side, prof: o.prof, can_kumal: false });
    const index = hand.findIndex(prof => prof === o.prof);
    hand.splice(index, 1);
    return {
        phase: "piece_phase_played",
        hand_of_black: old.hand_of_black,
        hand_of_white: old.hand_of_white,
        by_whom: old.who_goes_next,
        board: old.board
    }
}

/**
 * Resolved な状態に駒フェイズを適用。省略された情報を復元しながら適用しなきゃいけないので、かなりしんどい。
 * @param old 呼び出し後に破壊されている可能性があるので、後で使いたいならディープコピーしておくこと。
 * @param o 
 */
export function disambiguate_piece_phase_and_apply(old: ResolvedGameState, o: Readonly<PiecePhaseMove>): PiecePhasePlayed {
    // The thing is that we have to infer which piece has moved, since the usual notation does not signify
    // where the piece comes from.
    // 面倒なのは、具体的にどの駒が動いたのかを、棋譜の情報から復元してやらないといけないという点である（普通始点は書かないので）。

    // first, use the `side` field and the `prof` field to list up the possible points of origin 
    // (note that "in hand" is a possibility).
    const possible_points_of_origin = lookup_coords_from_side_and_prof(old.board, o.side, o.prof);
    const hand = old[o.side === "白" ? "hand_of_white" : "hand_of_black"];
    const exists_in_hand: boolean = hand.some(prof => prof === o.prof);

    if (typeof o.from === "string") {
        if (o.from === "打") {
            if (exists_in_hand) {
                if (isUnpromotedShogiProfession(o.prof)) {
                    return parachute(old, { side: o.side, prof: o.prof, to: o.to });
                } else {
                    // UnpromotedShogiProfession 以外は手駒に入っているはずがないので、
                    // exists_in_hand が満たされている時点で UnpromotedShogiProfession であることは既に確定している
                    throw new Error("should not reach here")
                }
            } else {
                throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}打とのことですが、${o.side}の手駒に${professionFullName(o.prof)}はありません`);
            }
        } else if (o.from === "右") {
            const pruned = possible_points_of_origin.filter(from => can_move(old.board, { from, to: o.to }));
            if (pruned.length === 0) {
                throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}右とのことですが、そのような移動ができる${o.side}の${professionFullName(o.prof)}は盤上にありません`);
            }
            const rightmost = RightmostWhenSeenFrom(o.side, pruned);
            if (rightmost.length === 1) {
                return move_piece(old, { from: rightmost[0]!, to: o.to, side: o.side, promote: o.promotes ?? null });
            } else {
                throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}とのことですが、そのような移動ができる${o.side}の${professionFullName(o.prof)}が盤上に複数あります`);
            }
        } else if (o.from === "左") {
            const pruned = possible_points_of_origin.filter(from => can_move(old.board, { from, to: o.to }));
            if (pruned.length === 0) {
                throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}左とのことですが、そのような移動ができる${o.side}の${professionFullName(o.prof)}は盤上にありません`);
            }
            const leftmost = LeftmostWhenSeenFrom(o.side, pruned);
            if (leftmost.length === 1) {
                return move_piece(old, { from: leftmost[0]!, to: o.to, side: o.side, promote: o.promotes ?? null });
            } else {
                throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}とのことですが、そのような移動ができる${o.side}の${professionFullName(o.prof)}が盤上に複数あります`);
            }
        } else {
            throw new Error("「打」「右」「左」「成」「不成」以外の接尾辞は未実装です。７六金（７五）などと書いて下さい。");
        }
    } else if (typeof o.from === "undefined") {
        // 駒がどこから来たかが分からない。
        // このようなときには、
        // ・打つしかないなら打つ
        // ・そうでなくて、目的地に行ける駒が盤上に 1 種類しかないなら、それをする
        // という解決をすることになる。
        //
        // しかし、このゲームにおいて、二ポは「着手できない手」ではなくて、「着手した後に、石フェイズ解消後にもそれが残ってしまっていたら、反則負け」となるものである。
        // この前提のもとで、ポが横並びしているときに、片方のポの前にある駒を取ろうとしている状況を考えてほしい。
        // すると、常識的にはそんなあからさまな二ポは指さないので、1マス前進して取るのが当たり前であり、
        // それを棋譜に起こすときにわざわざ「直」を付けるなどバカバカしい。
        // よって、出発点推論においては、最初は二ポは排除して推論することとする。

        // We have no info on where the piece came from.
        // In such cases, the rational way of inference is
        // * Parachute a piece if you have to.
        // * Otherwise, if there is only one piece on board that can go to the specified destination, take that move.
        // 
        // However, in this game, doubled pawns are not an impossible move, but rather a move that cause you to lose if it remained even after the removal-by-go.
        // Under such an assumption, consider the situation where there are two pawns next to each other and there is an enemy piece right in front of one of it.
        // In such a case, it is very easy to see that taking the piece diagonally results in doubled pawns.
        // Hence, when writing that move down, you don't want to explicitly annotate such a case with 直.
        // Therefore, when inferring the point of origin, I first ignore the doubled pawns.

        const pruned = possible_points_of_origin.filter(from => can_move_and_not_cause_doubled_pawns(old.board, { from, to: o.to }));

        if (pruned.length === 0) {
            if (o.prof === "キ") {
                // キャスリングおよびくまりんぐはキング王の動きとして書く。
                // 常にキングが通常動けない範囲への移動となる。
                const from = possible_points_of_origin[0]!;
                const king = get_entity_from_coord(old.board, from);
                if (king?.type === "王") {
                    if (king.never_moved) {
                        // Invalid kumalings are rejected in the `kumaling` function.
                        // Hence it's ok to call the function without checking anything.
                        return kumaling(old, { from, to: o.to, side: o.side });
                    } else if (king.has_moved_only_once) {
                        const diff = coordDiffSeenFrom(o.side, { to: o.to, from });
                        if (diff.v === 0 && (diff.h === 2 || diff.h === -2) &&
                            ((o.side === "黒" && from[1] === "八") || (o.side === "白" && from[1] === "二"))
                        ) {
                            return castling(old, { from, to: o.to, side: o.side });
                        } else {
                            throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}とのことですが、そのような移動ができる${o.side}の${professionFullName(o.prof)}は盤上にありません`);
                        }
                    } else {
                        throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}とのことですが、そのような移動ができる${o.side}の${professionFullName(o.prof)}は盤上にありません`);
                    }
                } else {
                    throw new Error("should not reach here")
                }

            } else if (exists_in_hand) {
                if (isUnpromotedShogiProfession(o.prof)) {
                    return parachute(old, { side: o.side, prof: o.prof, to: o.to });
                } else {
                    // UnpromotedShogiProfession 以外は手駒に入っているはずがないので、
                    // exists_in_hand が満たされている時点で UnpromotedShogiProfession であることは既に確定している
                    throw new Error("should not reach here")
                }
            } else {
                const pruned_allowing_doubled_pawns = possible_points_of_origin.filter(from => can_move(old.board, { from, to: o.to }));
                if (pruned_allowing_doubled_pawns.length === 0) {
                    throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}とのことですが、そのような移動ができる${o.side}の${professionFullName(o.prof)}は盤上にありません`);
                } else if (pruned_allowing_doubled_pawns.length === 1) {
                    const from = pruned_allowing_doubled_pawns[0]!;
                    return move_piece(old, { from, to: o.to, side: o.side, promote: o.promotes ?? null });
                } else {
                    throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}とのことですが、そのような移動ができる${o.side}の${professionFullName(o.prof)}が盤上に複数あり、しかもどれを指しても二ポです`);
                }
            }
        } else if (pruned.length === 1) {
            const from = pruned[0]!;
            return move_piece(old, { from, to: o.to, side: o.side, promote: o.promotes ?? null });
        } else {
            throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}とのことですが、そのような移動ができる${o.side}の${professionFullName(o.prof)}が盤上に複数あり、どれを採用するべきか分かりません`);
        }
    } else {
        const from: Coordinate = o.from;
        if (!possible_points_of_origin.some(c => coordEq(c, from))) {
            throw new Error(`${o.side}が${displayCoord(from)}から${displayCoord(o.to)}へと${professionFullName(o.prof)}を動かそうとしていますが、${displayCoord(from)}には${o.side}の${professionFullName(o.prof)}はありません`);
        }
        if (can_move(old.board, { from, to: o.to })) {
            return move_piece(old, { from, to: o.to, side: o.side, promote: o.promotes ?? null });
        } else if (o.prof === "キ") {
            // キャスリングおよびくまりんぐはキング王の動きとして書く。
            // 常にキングが通常動けない範囲への移動となる。
            const king = get_entity_from_coord(old.board, from);
            if (king?.type === "王") {
                if (king.never_moved) {
                    // Invalid kumalings are rejected in the `kumaling` function.
                    // Hence it's ok to call the function without checking anything.
                    return kumaling(old, { from, to: o.to, side: o.side });
                } else if (king.has_moved_only_once) {
                    const diff = coordDiffSeenFrom(o.side, { to: o.to, from });
                    if (diff.v === 0 && (diff.h === 2 || diff.h === -2) &&
                        ((o.side === "黒" && from[1] === "八") || (o.side === "白" && from[1] === "二"))
                    ) {
                        return castling(old, { from, to: o.to, side: o.side });
                    } else {
                        throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}とのことですが、そのような移動ができる${o.side}の${professionFullName(o.prof)}は盤上にありません`);
                    }
                } else {
                    throw new Error(`${o.side}が${displayCoord(o.to)}${o.prof}とのことですが、そのような移動ができる${o.side}の${professionFullName(o.prof)}は盤上にありません`);
                }
            } else {
                throw new Error("should not reach here")
            }
        } else {
            throw new Error(`${o.side}が${displayCoord(from)}から${displayCoord(o.to)}へと${professionFullName(o.prof)}を動かそうとしていますが、${professionFullName(o.prof)}は${displayCoord(from)}から${displayCoord(o.to)}へ動ける駒ではありません`);
        }
    }
}

/** くまりんぐ 
 */
function kumaling(old: ResolvedGameState, o: { from: Coordinate, to: Coordinate, side: Side }): PiecePhasePlayed {
    const king = get_entity_from_coord(old.board, o.from);
    if (!king) {
        throw new Error(`キング王が${displayCoord(o.from)}から${displayCoord(o.to)}へ動くくまりんぐを${o.side}が試みていますが、${displayCoord(o.from)}には駒がありません`);
    } else if (king.type === "碁") {
        throw new Error(`キング王が${displayCoord(o.from)}から${displayCoord(o.to)}へ動くくまりんぐを${o.side}が試みていますが、${displayCoord(o.from)}にあるのはキング王ではなく碁石です`);
    } else if (king.type !== "王") {
        throw new Error(`キング王が${displayCoord(o.from)}から${displayCoord(o.to)}へ動くくまりんぐを${o.side}が試みていますが、${displayCoord(o.from)}にはキング王ではない駒があります`);
    } else if (king.side !== o.side) {
        throw new Error(`キング王が${displayCoord(o.from)}から${displayCoord(o.to)}へ動くくまりんぐを${o.side}が試みていますが、${displayCoord(o.from)}にあるのは${opponentOf(o.side)}のキング王です`);
    }

    const lance = get_entity_from_coord(old.board, o.to);
    if (!lance) {
        throw new Error(`キング王が${displayCoord(o.from)}から${displayCoord(o.to)}へ動くくまりんぐを${o.side}が試みていますが、${displayCoord(o.to)}には駒がありません`);
    } else if (lance.type === "碁") {
        throw new Error(`キング王が${displayCoord(o.from)}から${displayCoord(o.to)}へ動くくまりんぐを${o.side}が試みていますが、${displayCoord(o.to)}にあるのは香車ではなく碁石です`)
    } else if (lance.type !== "しょ" || lance.prof !== "香") {
        throw new Error(`キング王が${displayCoord(o.from)}から${displayCoord(o.to)}へ動くくまりんぐを${o.side}が試みていますが、${displayCoord(o.from)}には香車ではない駒があります`);
    }

    if (king.never_moved) {
        if (lance.can_kumal) {
            put_entity_at_coord_and_also_adjust_flags(old.board, o.to, king);
            put_entity_at_coord_and_also_adjust_flags(old.board, o.from, lance);
            return {
                phase: "piece_phase_played",
                board: old.board,
                hand_of_black: old.hand_of_black,
                hand_of_white: old.hand_of_white,
                by_whom: old.who_goes_next
            }
        } else {
            throw new Error(`キング王が${displayCoord(o.from)}から${displayCoord(o.to)}へ動くくまりんぐを${o.side}が試みていますが、この香車は打たれた香車なのでくまりんぐの対象外です`);
        }
    } else {
        throw new Error(`キング王が${displayCoord(o.from)}から${displayCoord(o.to)}へ動くくまりんぐを${o.side}が試みていますが、このキング王は過去に動いたことがあるのでくまりんぐの対象外です`);
    }
}

/** `o.side` が駒を `o.from` から `o.to` に動かす。その駒が `o.from` から `o.to` へと can_move であることを要求する。キャスリング・くまりんぐは扱わないが、アンパッサンは扱う。 
 */
function move_piece(old: ResolvedGameState, o: { from: Coordinate, to: Coordinate, side: Side, promote: boolean | null }): PiecePhasePlayed {
    const piece_that_moves = get_entity_from_coord(old.board, o.from);
    if (!piece_that_moves) {
        throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}への移動を試みていますが、${displayCoord(o.from)}には駒がありません`);
    } else if (piece_that_moves.type === "碁") {
        throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}への移動を試みていますが、${displayCoord(o.from)}にあるのは碁石であり、駒ではありません`);
    } else if (piece_that_moves.side !== o.side) {
        throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}への移動を試みていますが、${displayCoord(o.from)}にあるのは${opponentOf(o.side)}の駒です`);
    }

    const res: boolean | "en passant" = can_move(old.board, { from: o.from, to: o.to });
    if (res === "en passant") {
        /**
         *          from[0] to[0]
         *         |  ..  |  ..  |
         * to[1]   |  ..  |  to  | 
         * from[1] | from | pawn |
         */
        const coord_horizontally_adjacent: Coordinate = [o.to[0], o.from[1]];

        put_entity_at_coord_and_also_adjust_flags(old.board, o.to, piece_that_moves);
        put_entity_at_coord_and_also_adjust_flags(old.board, o.from, null);
        put_entity_at_coord_and_also_adjust_flags(old.board, coord_horizontally_adjacent, null);

        return {
            phase: "piece_phase_played",
            board: old.board,
            hand_of_black: old.hand_of_black,
            hand_of_white: old.hand_of_white,
            by_whom: old.who_goes_next
        }
    } else if (!res) {
        throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}への移動を試みていますが、駒の動き上そのような移動はできません`)
    }

    if (is_promotable(piece_that_moves.prof)
        && (is_within_nth_furthest_rows(3, o.side, o.from) || is_within_nth_furthest_rows(3, o.side, o.to))
       ) {
        if (o.promote) {
            if (piece_that_moves.prof === "桂") {
                piece_that_moves.prof = "成桂";
            } else if (piece_that_moves.prof === "銀") {
                piece_that_moves.prof = "成銀";
            } else if (piece_that_moves.prof === "香") {
                piece_that_moves.prof = "成香";
            } else if (piece_that_moves.prof === "キ") {
                piece_that_moves.prof = "超";
            } else if (piece_that_moves.prof === "ポ") {
                piece_that_moves.prof = "と";
            }
        }
    } else {
        if (o.promote !== null) {
            throw new Error(`${o.side}が${displayCoord(o.to)}${piece_that_moves.prof}${o.promote ? "成" : "不成"}とのことですが、この移動は成りを発生させないので「${o.promote ? "成" : "不成"}」表記はできません`);
        }
    }


    const occupier = get_entity_from_coord(old.board, o.to);
    if (!occupier) {
        if (piece_that_moves.prof === "ポ" && piece_that_moves.never_moved && o.to[1] === "五") {
            piece_that_moves.subject_to_en_passant = true;
        }

        put_entity_at_coord_and_also_adjust_flags(old.board, o.to, piece_that_moves);
        put_entity_at_coord_and_also_adjust_flags(old.board, o.from, null);
        return {
            phase: "piece_phase_played",
            board: old.board,
            hand_of_black: old.hand_of_black,
            hand_of_white: old.hand_of_white,
            by_whom: old.who_goes_next
        }
    } else if (occupier.type === "碁") {
        if (occupier.side === o.side) {
            throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}への移動を試みていますが、${displayCoord(o.to)}に自分の碁石があるので、移動できません`);
        } else {
            put_entity_at_coord_and_also_adjust_flags(old.board, o.to, piece_that_moves);
            put_entity_at_coord_and_also_adjust_flags(old.board, o.from, null);
            return {
                phase: "piece_phase_played",
                board: old.board,
                hand_of_black: old.hand_of_black,
                hand_of_white: old.hand_of_white,
                by_whom: old.who_goes_next
            }
        }
    } else {
        if (occupier.side === o.side) {
            throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}への移動を試みていますが、${displayCoord(o.to)}に自分の駒があるので、移動できません`);
        } else if (occupier.type === "しょ") {
            (o.side === "白" ? old.hand_of_white : old.hand_of_black).push(unpromote(occupier.prof));
            put_entity_at_coord_and_also_adjust_flags(old.board, o.to, piece_that_moves);
            put_entity_at_coord_and_also_adjust_flags(old.board, o.from, null);
            return {
                phase: "piece_phase_played",
                board: old.board,
                hand_of_black: old.hand_of_black,
                hand_of_white: old.hand_of_white,
                by_whom: old.who_goes_next
            };
        } else {
            put_entity_at_coord_and_also_adjust_flags(old.board, o.to, piece_that_moves);
            put_entity_at_coord_and_also_adjust_flags(old.board, o.from, null);
            return {
                phase: "piece_phase_played",
                board: old.board,
                hand_of_black: old.hand_of_black,
                hand_of_white: old.hand_of_white,
                by_whom: old.who_goes_next
            };
        }
    }
}

function deltaEq(d: { v: number, h: number }, delta: { v: number, h: number }) {
    return d.v === delta.v && d.h === delta.h;
}

/**
 * `o.from` に駒があってその駒が `o.to` へと動く余地があるかどうかを返す。`o.to` が味方の駒で埋まっていたら false だし、ポーンの斜め前に敵駒がないなら斜め前は false となる。
 *  Checks whether there is a piece at `o.from` which can move to `o.to`. When `o.to` is occupied by an ally, this function returns false, 
 *  and when there is no enemy piece diagonal to pawn, this function returns false for the diagonal direction.
 * @param board 
 * @param o 
 * @returns 
 */
export function can_move(board: Readonly<Board>, o: { from: Coordinate, to: Coordinate }): boolean | "en passant" {
    const p = get_entity_from_coord(board, o.from);
    if (!p) {
        return false;
    }
    if (p.type === "碁") {
        return false;
    }
    const piece_at_destination = get_entity_from_coord(board, o.to);
    if (piece_at_destination?.side === p.side) {
        return false;
    }

    if (p.prof !== "ポ") {
        return can_see(board, o);
    }

    const delta = coordDiffSeenFrom(p.side, o);

    // can always move forward
    if (delta.v === 1 && delta.h === 0) {
        return true;
    }

    // can take diagonally, as long as an opponent's piece is located there, or when it is an en passant
    if (delta.v === 1 && (delta.h === 1 || delta.h === -1)) {
        if (piece_at_destination?.side === opponentOf(p.side)) {
            return true;
        } else {
            const coord_horizontally_adjacent = applyDeltaSeenFrom(p.side, o.from, { v: 0, h: delta.h });
            const piece_horizontally_adjacent = get_entity_from_coord(board, coord_horizontally_adjacent);
            if (o.from[1] === "五"
                && piece_horizontally_adjacent?.type === "ス"
                && piece_horizontally_adjacent.prof === "ポ"
                && piece_horizontally_adjacent.subject_to_en_passant) {
                return "en passant";
            } else {
                return false;
            }
        }
    }

    if (p.never_moved && delta.v === 2 && delta.h === 0) {
        // can move two in the front, unless blocked
        const coord_in_front = applyDeltaSeenFrom(p.side, o.from, { v: 1, h: 0 });
        const coord_two_in_front = applyDeltaSeenFrom(p.side, o.from, { v: 2, h: 0 });
        if (get_entity_from_coord(board, coord_in_front)
            || get_entity_from_coord(board, coord_two_in_front)) {
            return false;
        }
        return true;
    } else {
        return false;
    }
}

/**
 * `o.from` に駒があってその駒が `o.to` へと利いているかどうかを返す。ポーンの斜め利きは常に can_see と見なす。ポーンの2マス移動は、駒を取ることができないので「利き」ではない。
 *  Checks whether there is a piece at `o.from` which looks at `o.to`. The diagonal move of pawn is always considered. A pawn never sees two squares in the front; it can only move to there.
 * @param board 
 * @param o 
 * @returns 
 */
export function can_see(board: Readonly<Board>, o: { from: Coordinate, to: Coordinate }): boolean {
    const p = get_entity_from_coord(board, o.from);
    if (!p) {
        return false;
    }
    if (p.type === "碁") {
        return false;
    }

    const delta = coordDiffSeenFrom(p.side, o);
    if (p.prof === "成桂" || p.prof === "成銀" || p.prof === "成香" || p.prof === "金") {
        return [
            { v: 1, h: -1 }, { v: 1, h: 0 }, { v: 1, h: 1 },
            { v: 0, h: -1 }, /************/  { v: 0, h: 1 },
            /**************/ { v: -1, h: 0 } /**************/
        ].some(d => deltaEq(d, delta));
    } else if (p.prof === "銀") {
        return [
            { v: 1, h: -1 }, { v: 1, h: 0 }, { v: 1, h: 1 },
            /**********************************************/
            { v: -1, h: -1 }, /************/ { v: 1, h: 1 },
        ].some(d => deltaEq(d, delta));
    } else if (p.prof === "桂") {
        return [
            { v: 2, h: -1 }, { v: 2, h: 1 }
        ].some(d => deltaEq(d, delta));
    } else if (p.prof === "ナ") {
        return [
            { v: 2, h: -1 }, { v: 2, h: 1 },
            { v: -2, h: -1 }, { v: -2, h: 1 },
            { v: -1, h: 2 }, { v: 1, h: 2 },
            { v: -1, h: -2 }, { v: 1, h: -2 }
        ].some(d => deltaEq(d, delta));
    } else if (p.prof === "キ") {
        return [
            { v: 1, h: -1 }, { v: 1, h: 0 }, { v: 1, h: 1 },
            { v: 0, h: -1 }, /*************/  { v: 0, h: 1 },
            { v: -1, h: -1 }, { v: -1, h: 0 }, { v: -1, h: 1 },
        ].some(d => deltaEq(d, delta));
    } else if (p.prof === "と" || p.prof === "ク") {
        return long_range([
            { v: 1, h: -1 }, { v: 1, h: 0 }, { v: 1, h: 1 },
            { v: 0, h: -1 }, /*************/  { v: 0, h: 1 },
            { v: -1, h: -1 }, { v: -1, h: 0 }, { v: -1, h: 1 },
        ], board, o, p.side);
    } else if (p.prof === "ビ") {
        return long_range([
            { v: 1, h: -1 }, { v: 1, h: 1 }, { v: -1, h: -1 }, { v: -1, h: 1 },
        ], board, o, p.side);
    } else if (p.prof === "ル") {
        return long_range([
            { v: 1, h: 0 }, { v: 0, h: -1 }, { v: 0, h: 1 }, { v: -1, h: 0 },
        ], board, o, p.side);
    } else if (p.prof === "香") {
        return long_range([{ v: 1, h: 0 }], board, o, p.side);
    } else if (p.prof === "超") {
        return true;
    } else if (p.prof === "ポ") {
        if ([{ v: 1, h: -1 }, { v: 1, h: 0 }, { v: 1, h: 1 }].some(d => deltaEq(d, delta))) {
            return true;
        } else {
            // a pawn can never see two squares in front; it can only move to there
            return false;
        }
    } else {
        const _: never = p.prof;
        throw new Error("Should not reach here");
    }
}

// since this function is only used to interpolate between two valid points, there is no need to perform and out-of-bounds check.
function applyDeltaSeenFrom(side: Side, from: Coordinate, delta: { v: number, h: number }): Coordinate {
    if (side === "白") {
        const [from_column, from_row] = from;
        const from_row_index = "一二三四五六七八九".indexOf(from_row);
        const from_column_index = "９８７６５４３２１".indexOf(from_column);
        const to_column_index = from_column_index + delta.h;
        const to_row_index = from_row_index + delta.v;
        const columns: ShogiColumnName[] = ["９", "８", "７", "６", "５", "４", "３", "２", "１"];
        const rows: ShogiRowName[] = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
        return [columns[to_column_index]!, rows[to_row_index]!];
    } else {
        const [from_column, from_row] = from;
        const from_row_index = "一二三四五六七八九".indexOf(from_row);
        const from_column_index = "９８７６５４３２１".indexOf(from_column);
        const to_column_index = from_column_index - delta.h;
        const to_row_index = from_row_index - delta.v;
        const columns: ShogiColumnName[] = ["９", "８", "７", "６", "５", "４", "３", "２", "１"];
        const rows: ShogiRowName[] = ["一", "二", "三", "四", "五", "六", "七", "八", "九"];
        return [columns[to_column_index]!, rows[to_row_index]!];
    }
}

function long_range(directions: { v: number, h: number }[], board: Readonly<Board>, o: { from: Coordinate, to: Coordinate }, side: Side): boolean {
    const delta = coordDiffSeenFrom(side, o);

    const matching_directions = directions.filter(direction =>
        delta.v * direction.v + delta.h * direction.h > 0 /* inner product is positive */
        && delta.v * direction.h - direction.v * delta.h === 0 /* cross product is zero */
    );

    if (matching_directions.length === 0) {
        return false;
    }

    const direction = matching_directions[0]!;
    for (let i = { v: direction.v, h: direction.h };
        !deltaEq(i, delta);
        i.v += direction.v, i.h += direction.h) {
        const coord = applyDeltaSeenFrom(side, o.from, i);
        if (get_entity_from_coord(board, coord)) {
            // blocked by something; cannot see
            return false;
        }
    }

    return true;
}

function can_move_and_not_cause_doubled_pawns(board: Readonly<Board>, o: { from: Coordinate, to: Coordinate }): boolean {
    if (!can_move(board, o)) {
        return false;
    }

    const piece = get_entity_from_coord(board, o.from);
    if (piece?.type === "ス" && piece.prof === "ポ") {
        if (o.from[0] === o.to[0]) { // no risk of doubled pawns when the pawn moves straight
            return true;
        } else {
            const pawn_coords = lookup_coords_from_side_and_prof(board, piece.side, "ポ");
            const problematic_pawns = pawn_coords.filter(([col, _row]) => col === o.to[0]);

            // if there are no problematic pawns, return true
            // if there are, we want to avoid such a move in this function, so false
            return problematic_pawns.length === 0;
        }
    } else {
        return true;
    }
}

function castling(old: ResolvedGameState, o: { from: Coordinate, to: Coordinate; side: Side; }): PiecePhasePlayed {
    // 検査済：
    // ① キング王が1回だけ前進した状態で
    //-----------------------------------
    // これから検査：
    // ② キャスリング対象のルーク（以下A）は一度も動いておらず
    // ③ 相手からの王手（チェック）が掛かっておらず移動先のマスと通過点のマスにも敵の駒の利きはなく
    // ④ キング王とAの間に駒（チェス、将棋）が無い場合に使用できる

    const from_column_index = "９８７６５４３２１".indexOf(o.from[0]);
    const to_column_index = "９８７６５４３２１".indexOf(o.to[0]);

    const rook_coord: Coordinate = [from_column_index < to_column_index ? "１" : "９", o.from[1]];
    const rook = get_entity_from_coord(old.board, rook_coord);

    const coord_that_king_passes_through: Coordinate = ["９８７６５４３２１"[(from_column_index + to_column_index) / 2] as ShogiColumnName, o.from[1]];

    if (rook?.type !== "ス" || rook.prof !== "ル") {
        throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}へとキング王をキャスリングしようとしていますが、${displayCoord(rook_coord)}にルークがないのでキャスリングできません`);
    }

    if (!rook.never_moved) {
        throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}へとキング王をキャスリングしようとしていますが、${displayCoord(rook_coord)}にあるルークは既に動いたことがあるルークなのでキャスリングできません`);
    }

    if (do_any_of_my_pieces_see(old.board, o.from, opponentOf(o.side))) {
        throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}へとキング王をキャスリングしようとしていますが、相手からの王手（チェック）が掛かっているのでキャスリングできません`);
    }

    if (do_any_of_my_pieces_see(old.board, coord_that_king_passes_through, opponentOf(o.side))) {
        throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}へとキング王をキャスリングしようとしていますが、通過点のマスに敵の駒の利きがあるのでキャスリングできません`);
    }

    if (do_any_of_my_pieces_see(old.board, o.to, opponentOf(o.side))) {
        throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}へとキング王をキャスリングしようとしていますが、移動先のマスに敵の駒の利きがあるのでキャスリングできません`);
    }

    const coords_between_king_and_rook: Coordinate[] = columnsBetween(o.from[0], o.to[0]).map(col => [col, o.from[1]]);

    const has_shogi_or_chess_piece = coords_between_king_and_rook.some(coord => {
        const entity = get_entity_from_coord(old.board, coord);
        return entity?.type === "しょ" || entity?.type === "ス" || entity?.type === "碁"
    });

    if (has_shogi_or_chess_piece) {
        throw new Error(`${o.side}が${displayCoord(o.from)}から${displayCoord(o.to)}へとキング王をキャスリングしようとしていますが、キング王とルークの間に駒があるのでキャスリングできません`);
    }

    // ⑤ 間に碁石があれば取り除き
    coords_between_king_and_rook.forEach(coord => put_entity_at_coord_and_also_adjust_flags(old.board, coord, null));

    // ⑥ キング王は A の方向に 2 マス移動し
    put_entity_at_coord_and_also_adjust_flags(old.board, o.to, {
        prof: "キ",
        side: o.side,
        type: "王",
        has_moved_only_once: false,
        never_moved: false,
    });
    put_entity_at_coord_and_also_adjust_flags(old.board, o.from, null);

    // ⑦ A はキング王を飛び越した隣のマスに移動する
    put_entity_at_coord_and_also_adjust_flags(old.board, coord_that_king_passes_through, rook);
    put_entity_at_coord_and_also_adjust_flags(old.board, rook_coord, null);

    return {
        phase: "piece_phase_played",
        board: old.board,
        hand_of_black: old.hand_of_black,
        hand_of_white: old.hand_of_white,
        by_whom: old.who_goes_next
    }
}

function do_any_of_my_pieces_see(board: Readonly<Board>, coord: Coordinate, side: Side): boolean {
    const opponent_piece_coords = lookup_coords_from_side(board, side);
    return opponent_piece_coords.some(from => can_see(board, { from, to: coord }))
}
