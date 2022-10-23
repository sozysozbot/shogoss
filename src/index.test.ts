import { main } from ".";

test("hako3", () => {
	expect(main([
		{ "piece_phase": { "side": "黒", "to": ["７", "五"], "prof": "ポ" }, "stone_to": ["７", "四"] },
		{ "piece_phase": { "side": "白", "to": ["３", "四"], "prof": "ナ" }, "stone_to": ["１", "四"] },
		{ "piece_phase": { "side": "黒", "to": ["６", "五"], "prof": "ポ" }, "stone_to": ["２", "五"] },
	])).toEqual({
		phase: "resolved",
		hand_of_black: [],
		hand_of_white: [],
		who_goes_next: "白",
		board: [
			[
				{ type: "しょ", side: "白", prof: "香", can_kumal: true },
				{ type: "しょ", side: "白", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "白", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "白", prof: "金", can_kumal: false },
				{ type: "王", side: "白", prof: "キ", never_moved: true, has_moved_only_once: false },
				{ type: "しょ", side: "白", prof: "金", can_kumal: false },
				{ type: "しょ", side: "白", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "白", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "白", prof: "香", can_kumal: true },
			],
			[
				{ type: "ス", side: "白", prof: "ル", never_moved: true },
				{ type: "ス", side: "白", prof: "ナ", never_moved: true },
				{ type: "ス", side: "白", prof: "ビ", never_moved: true },
				null,
				{ type: "ス", side: "白", prof: "ク", never_moved: true },
				null,
				{ type: "ス", side: "白", prof: "ビ", never_moved: true },
				null,
				{ type: "ス", side: "白", prof: "ル", never_moved: true },
			],
			[
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
			],
			[null, null, { type: "碁", side: "黒" }, null, null, null, { type: "ス", side: "白", prof: "ナ", never_moved: false }, null, { type: "碁", side: "白" }],
			[null, null, { type: "ス", side: "黒", prof: "ポ", never_moved: false }, { type: "ス", side: "黒", prof: "ポ", never_moved: false }, null, null, null, { type: "碁", side: "黒" }, null,],
			[null, null, null, null, null, null, null, null, null,],
			[
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				null,
				null,
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
			],
			[
				{ type: "ス", side: "黒", prof: "ル", never_moved: true },
				{ type: "ス", side: "黒", prof: "ナ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ビ", never_moved: true },
				null,
				{ type: "ス", side: "黒", prof: "ク", never_moved: true },
				null,
				{ type: "ス", side: "黒", prof: "ビ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ナ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ル", never_moved: true },
			],
			[
				{ type: "しょ", side: "黒", prof: "香", can_kumal: true },
				{ type: "しょ", side: "黒", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "金", can_kumal: false },
				{ type: "王", side: "黒", prof: "キ", never_moved: true, has_moved_only_once: false },
				{ type: "しょ", side: "黒", prof: "金", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "香", can_kumal: true },
			],
		]
	})

});
test("hako4", () => {

	expect(main([
		{ "piece_phase": { "side": "黒", "to": ["７", "五"], "prof": "ポ" }, "stone_to": ["７", "四"] },
		{ "piece_phase": { "side": "白", "to": ["３", "四"], "prof": "ナ" }, "stone_to": ["１", "四"] },
		{ "piece_phase": { "side": "黒", "to": ["６", "五"], "prof": "ポ" }, "stone_to": ["２", "五"] },
		{ "piece_phase": { "side": "白", "to": ["１", "一"], "prof": "キ" }, "stone_to": ["１", "五"] },
	])).toEqual({
		phase: "resolved",
		hand_of_black: [],
		hand_of_white: [],
		who_goes_next: "黒",
		board: [
			[
				{ type: "しょ", side: "白", prof: "香", can_kumal: true },
				{ type: "しょ", side: "白", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "白", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "白", prof: "金", can_kumal: false },
				{ type: "しょ", side: "白", prof: "香", can_kumal: false },
				{ type: "しょ", side: "白", prof: "金", can_kumal: false },
				{ type: "しょ", side: "白", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "白", prof: "桂", can_kumal: false },
				{ type: "王", side: "白", prof: "キ", never_moved: false, has_moved_only_once: true },
			],
			[
				{ type: "ス", side: "白", prof: "ル", never_moved: true },
				{ type: "ス", side: "白", prof: "ナ", never_moved: true },
				{ type: "ス", side: "白", prof: "ビ", never_moved: true },
				null,
				{ type: "ス", side: "白", prof: "ク", never_moved: true },
				null,
				{ type: "ス", side: "白", prof: "ビ", never_moved: true },
				null,
				{ type: "ス", side: "白", prof: "ル", never_moved: true },
			],
			[
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
			],
			[null, null, { type: "碁", side: "黒" }, null, null, null, { type: "ス", side: "白", prof: "ナ", never_moved: false }, null, { type: "碁", side: "白" }],
			[null, null, { type: "ス", side: "黒", prof: "ポ", never_moved: false }, { type: "ス", side: "黒", prof: "ポ", never_moved: false }, null, null, null, { type: "碁", side: "黒" }, { type: "碁", side: "白" }],
			[null, null, null, null, null, null, null, null, null,],
			[
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				null,
				null,
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
			],
			[
				{ type: "ス", side: "黒", prof: "ル", never_moved: true },
				{ type: "ス", side: "黒", prof: "ナ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ビ", never_moved: true },
				null,
				{ type: "ス", side: "黒", prof: "ク", never_moved: true },
				null,
				{ type: "ス", side: "黒", prof: "ビ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ナ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ル", never_moved: true },
			],
			[
				{ type: "しょ", side: "黒", prof: "香", can_kumal: true },
				{ type: "しょ", side: "黒", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "金", can_kumal: false },
				{ type: "王", side: "黒", prof: "キ", never_moved: true, has_moved_only_once: false },
				{ type: "しょ", side: "黒", prof: "金", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "香", can_kumal: true },
			],
		]
	})

});

test("hako9", () => {
	expect(main([
		{ "piece_phase": { "side": "黒", "to": ["７", "五"], "prof": "ポ" }, "stone_to": ["７", "四"] },
		{ "piece_phase": { "side": "白", "to": ["３", "四"], "prof": "ナ" }, "stone_to": ["１", "四"] },
		{ "piece_phase": { "side": "黒", "to": ["６", "五"], "prof": "ポ" }, "stone_to": ["２", "五"] },
		{ "piece_phase": { "side": "白", "to": ["１", "一"], "prof": "キ" }, "stone_to": ["１", "五"] },
		{ "piece_phase": { "side": "黒", "to": ["４", "五"], "prof": "ポ" }, "stone_to": ["５", "六"] },
		{ "piece_phase": { "side": "白", "to": ["４", "二"], "prof": "ナ" }, "stone_to": ["１", "六"] },
		{ "piece_phase": { "side": "黒", "to": ["９", "五"], "prof": "ポ" }, "stone_to": ["２", "四"] },
		{ "piece_phase": { "side": "白", "to": ["２", "二"], "prof": "銀" }, "stone_to": ["２", "六"] },
		{ "piece_phase": { "side": "黒", "to": ["１", "六"], "prof": "ポ" }, "stone_to": ["３", "六"] }, 
	])).toEqual({
		phase: "resolved",
		hand_of_black: [],
		hand_of_white: [],
		who_goes_next: "白",
		board: [
			[
				{ type: "しょ", side: "白", prof: "香", can_kumal: true },
				{ type: "しょ", side: "白", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "白", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "白", prof: "金", can_kumal: false },
				{ type: "しょ", side: "白", prof: "香", can_kumal: false },
				{ type: "しょ", side: "白", prof: "金", can_kumal: false },
				null,
				{ type: "しょ", side: "白", prof: "桂", can_kumal: false },
				{ type: "王", side: "白", prof: "キ", never_moved: false, has_moved_only_once: true },
			],
			[
				{ type: "ス", side: "白", prof: "ル", never_moved: true },
				{ type: "ス", side: "白", prof: "ナ", never_moved: true },
				{ type: "ス", side: "白", prof: "ビ", never_moved: true },
				null,
				{ type: "ス", side: "白", prof: "ク", never_moved: true },
				{ type: "ス", side: "白", prof: "ナ", never_moved: false },
				{ type: "ス", side: "白", prof: "ビ", never_moved: true },
				{ type: "しょ", side: "白", prof: "銀", can_kumal: false },
				{ type: "ス", side: "白", prof: "ル", never_moved: true },
			],
			[
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
			],
			[null, null, { type: "碁", side: "黒" }, null, null, null, null, { type: "碁", side: "黒" }, { type: "碁", side: "白" }],
			[{ type: "ス", side: "黒", prof: "ポ", never_moved: false }, null, { type: "ス", side: "黒", prof: "ポ", never_moved: false }, { type: "ス", side: "黒", prof: "ポ", never_moved: false }, null, { type: "ス", side: "黒", prof: "ポ", never_moved: false }, null, { type: "碁", side: "黒" }, { type: "碁", side: "白" }],
			[null, null, null, null, { type: "碁", side: "黒" }, null, { type: "碁", side: "黒" }, null, { type: "ス", side: "黒", prof: "ポ", never_moved: false }],
			[
				null,
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				null,
				null,
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				null,
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				null,
			],
			[
				{ type: "ス", side: "黒", prof: "ル", never_moved: true },
				{ type: "ス", side: "黒", prof: "ナ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ビ", never_moved: true },
				null,
				{ type: "ス", side: "黒", prof: "ク", never_moved: true },
				null,
				{ type: "ス", side: "黒", prof: "ビ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ナ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ル", never_moved: true },
			],
			[
				{ type: "しょ", side: "黒", prof: "香", can_kumal: true },
				{ type: "しょ", side: "黒", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "金", can_kumal: false },
				{ type: "王", side: "黒", prof: "キ", never_moved: true, has_moved_only_once: false },
				{ type: "しょ", side: "黒", prof: "金", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "香", can_kumal: true },
			],
		]
	})
});


test("hako14", () => {
	expect(main([
		{ "piece_phase": { "side": "黒", "to": ["７", "五"], "prof": "ポ" }, "stone_to": ["７", "四"] },
		{ "piece_phase": { "side": "白", "to": ["３", "四"], "prof": "ナ" }, "stone_to": ["１", "四"] },
		{ "piece_phase": { "side": "黒", "to": ["６", "五"], "prof": "ポ" }, "stone_to": ["２", "五"] },
		{ "piece_phase": { "side": "白", "to": ["１", "一"], "prof": "キ" }, "stone_to": ["１", "五"] },
		{ "piece_phase": { "side": "黒", "to": ["４", "五"], "prof": "ポ" }, "stone_to": ["５", "六"] },
		{ "piece_phase": { "side": "白", "to": ["４", "二"], "prof": "ナ" }, "stone_to": ["１", "六"] },
		{ "piece_phase": { "side": "黒", "to": ["９", "五"], "prof": "ポ" }, "stone_to": ["２", "四"] },
		{ "piece_phase": { "side": "白", "to": ["２", "二"], "prof": "銀" }, "stone_to": ["２", "六"] },
		{ "piece_phase": { "side": "黒", "to": ["１", "六"], "prof": "ポ" }, "stone_to": ["３", "六"] },
		{ "piece_phase": { "side": "白", "to": ["３", "一"], "prof": "金" }, "stone_to": ["３", "四"] },
		{ "piece_phase": { "side": "黒", "to": ["１", "五"], "prof": "ポ" }, "stone_to": ["４", "四"] },
		{ "piece_phase": { "side": "白", "to": ["４", "四"], "prof": "ポ" }, "stone_to": ["３", "五"] },
		{ "piece_phase": { "side": "黒", "to": ["４", "四"], "prof": "ポ" }, "stone_to": ["４", "五"] },
		{ "piece_phase": { "side": "白", "to": ["４", "四"], "prof": "ポ", "from": "左" }, "stone_to": ["３", "三"] }, 
	])).toEqual({
		phase: "resolved",
		hand_of_black: [],
		hand_of_white: [],
		who_goes_next: "黒",
		board: [
			[
				{ type: "しょ", side: "白", prof: "香", can_kumal: true },
				{ type: "しょ", side: "白", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "白", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "白", prof: "金", can_kumal: false },
				{ type: "しょ", side: "白", prof: "香", can_kumal: false },
				null,
				{ type: "しょ", side: "白", prof: "金", can_kumal: false },
				{ type: "しょ", side: "白", prof: "桂", can_kumal: false },
				{ type: "王", side: "白", prof: "キ", never_moved: false, has_moved_only_once: true },
			],
			[
				{ type: "ス", side: "白", prof: "ル", never_moved: true },
				{ type: "ス", side: "白", prof: "ナ", never_moved: true },
				{ type: "ス", side: "白", prof: "ビ", never_moved: true },
				null,
				{ type: "ス", side: "白", prof: "ク", never_moved: true },
				{ type: "ス", side: "白", prof: "ナ", never_moved: false },
				{ type: "ス", side: "白", prof: "ビ", never_moved: true },
				{ type: "しょ", side: "白", prof: "銀", can_kumal: false },
				{ type: "ス", side: "白", prof: "ル", never_moved: true },
			],
			[
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				null,
				{ type: "碁", side: "白" },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
				{ type: "ス", side: "白", prof: "ポ", never_moved: true },
			],
			[null, null, { type: "碁", side: "黒" }, null, null, { type: "ス", side: "白", prof: "ポ", never_moved: false }, { type: "碁", side: "白" }, { type: "碁", side: "黒" }, { type: "碁", side: "白" }],
			[{ type: "ス", side: "黒", prof: "ポ", never_moved: false }, null, { type: "ス", side: "黒", prof: "ポ", never_moved: false }, { type: "ス", side: "黒", prof: "ポ", never_moved: false }, null, { type: "碁", side: "黒" }, { type: "碁", side: "白" }, { type: "碁", side: "黒" }, { type: "ス", side: "黒", prof: "ポ", never_moved: false }],
			[null, null, null, null, { type: "碁", side: "黒" }, null, { type: "碁", side: "黒" }, null, null],
			[
				null,
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				null,
				null,
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				null,
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ポ", never_moved: true },
				null,
			],
			[
				{ type: "ス", side: "黒", prof: "ル", never_moved: true },
				{ type: "ス", side: "黒", prof: "ナ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ビ", never_moved: true },
				null,
				{ type: "ス", side: "黒", prof: "ク", never_moved: true },
				null,
				{ type: "ス", side: "黒", prof: "ビ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ナ", never_moved: true },
				{ type: "ス", side: "黒", prof: "ル", never_moved: true },
			],
			[
				{ type: "しょ", side: "黒", prof: "香", can_kumal: true },
				{ type: "しょ", side: "黒", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "金", can_kumal: false },
				{ type: "王", side: "黒", prof: "キ", never_moved: true, has_moved_only_once: false },
				{ type: "しょ", side: "黒", prof: "金", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "銀", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "桂", can_kumal: false },
				{ type: "しょ", side: "黒", prof: "香", can_kumal: true },
			],
		]
	})
})