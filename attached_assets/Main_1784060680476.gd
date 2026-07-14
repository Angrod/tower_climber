extends Control

# ---------------------------------------------------------
# TUNABLE ASSUMPTIONS — same numbers as the progression spreadsheet.
# Change these, hit play, feel the difference. Nothing else in this
# script needs to change when you tune these.
# ---------------------------------------------------------
const ENEMY_BASE_HP := 20.0
const ENEMY_HP_GROWTH := 0.08       # +8% per floor
const WALL_INTERVAL := 10           # every 10th floor is a "wall"
const WALL_MULTIPLIER := 3.0        # walls jump enemy HP 3x
const HERO_DAMAGE := 2.0            # damage per hero, per attack tick
const ATTACK_TICK_SECONDS := 0.65
const MAX_HEROES := 30
const GOLD_PER_KILL_BASE := 8
const GOLD_PER_KILL_PER_FLOOR := 3

# ---------------------------------------------------------
# STATE
# ---------------------------------------------------------
var floor_num := 1
var gold := 0
var hero_count := 1
var enemy_max_hp := 0.0
var enemy_hp := 0.0
var drawer_open := false

# UI references (built in code below — no separate scene file needed)
var gold_label: Label
var floor_label: Label
var hp_bar: ProgressBar
var hero_label: Label
var tap_area: Button
var drawer: PanelContainer
var drawer_content: Label
var tab_names := ["Heroes", "Soldiers", "Weapons", "Shop"]

func _ready() -> void:
	set_enemy_for_floor(floor_num)
	_build_ui()
	var timer := Timer.new()
	timer.wait_time = ATTACK_TICK_SECONDS
	timer.autostart = true
	timer.timeout.connect(_on_attack_tick)
	add_child(timer)

# ---------------------------------------------------------
# MATH — this is the whole "wall breakpoint" model from the spreadsheet,
# ported directly into the game.
# ---------------------------------------------------------
func set_enemy_for_floor(f: int) -> void:
	var hp := ENEMY_BASE_HP * pow(1.0 + ENEMY_HP_GROWTH, f - 1)
	if f % WALL_INTERVAL == 0:
		hp *= WALL_MULTIPLIER
	enemy_max_hp = hp
	enemy_hp = hp

func is_boss_floor(f: int) -> bool:
	return f % WALL_INTERVAL == 0

# ---------------------------------------------------------
# GAME LOOP
# ---------------------------------------------------------
func _on_attack_tick() -> void:
	var dps := hero_count * HERO_DAMAGE
	enemy_hp = max(0.0, enemy_hp - dps)
	hp_bar.value = (enemy_hp / enemy_max_hp) * 100.0

	if enemy_hp <= 0.0:
		var reward := GOLD_PER_KILL_BASE + floor_num * GOLD_PER_KILL_PER_FLOOR
		gold += reward
		floor_num += 1
		set_enemy_for_floor(floor_num)
		_refresh_labels()

func _on_tap_spawn() -> void:
	hero_count = min(hero_count + 1, MAX_HEROES)
	_refresh_labels()

func _refresh_labels() -> void:
	gold_label.text = "Gold: %d" % gold
	var tag := "BOSS" if is_boss_floor(floor_num) else "Floor"
	floor_label.text = "%s %d" % [tag, floor_num]
	hero_label.text = "Heroes: %d" % hero_count
	hp_bar.value = (enemy_hp / enemy_max_hp) * 100.0

# ---------------------------------------------------------
# UI — built entirely in code so you can run this with zero scene
# editing. Swap these placeholder ColorRects/Labels for real art
# and sound whenever you're ready; the game logic above doesn't change.
# ---------------------------------------------------------
func _build_ui() -> void:
	var root := VBoxContainer.new()
	root.set_anchors_preset(Control.PRESET_FULL_RECT)
	add_child(root)

	# --- top status bar ---
	var top_bar := HBoxContainer.new()
	top_bar.custom_minimum_size = Vector2(0, 44)
	root.add_child(top_bar)

	gold_label = Label.new()
	gold_label.text = "Gold: 0"
	gold_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_bar.add_child(gold_label)

	floor_label = Label.new()
	floor_label.text = "Floor 1"
	floor_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	floor_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_bar.add_child(floor_label)

	hero_label = Label.new()
	hero_label.text = "Heroes: 1"
	hero_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_RIGHT
	hero_label.size_flags_horizontal = Control.SIZE_EXPAND_FILL
	top_bar.add_child(hero_label)

	# --- tower viewport: tap anywhere to spawn a hero ---
	tap_area = Button.new()
	tap_area.text = ""
	tap_area.size_flags_vertical = Control.SIZE_EXPAND_FILL
	tap_area.pressed.connect(_on_tap_spawn)
	root.add_child(tap_area)

	var tower_inner := VBoxContainer.new()
	tower_inner.set_anchors_preset(Control.PRESET_CENTER)
	tower_inner.alignment = BoxContainer.ALIGNMENT_CENTER
	tap_area.add_child(tower_inner)

	var monster_label := Label.new()
	monster_label.text = "the monster"
	monster_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tower_inner.add_child(monster_label)

	hp_bar = ProgressBar.new()
	hp_bar.custom_minimum_size = Vector2(200, 16)
	hp_bar.value = 100
	tower_inner.add_child(hp_bar)

	var hint := Label.new()
	hint.text = "tap anywhere to spawn a hero"
	hint.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
	tower_inner.add_child(hint)

	# --- collapsible drawer ---
	var tab_bar := HBoxContainer.new()
	root.add_child(tab_bar)
	for i in tab_names.size():
		var btn := Button.new()
		btn.text = tab_names[i]
		btn.size_flags_horizontal = Control.SIZE_EXPAND_FILL
		btn.pressed.connect(func(): _open_tab(tab_names[i]))
		tab_bar.add_child(btn)

	drawer = PanelContainer.new()
	drawer.custom_minimum_size = Vector2(0, 160)
	drawer.visible = false
	root.add_child(drawer)

	drawer_content = Label.new()
	drawer_content.autowrap_mode = TextServer.AUTOWRAP_WORD
	drawer.add_child(drawer_content)

func _open_tab(tab_name: String) -> void:
	drawer.visible = true
	match tab_name:
		"Heroes":
			drawer_content.text = "Heroes & skills go here — swordsman, archer, cleric, each with a level and a cost-to-level-up."
		"Soldiers":
			drawer_content.text = "Auto-spawning soldiers go here — unlock at a floor milestone, upgrade with gold."
		"Weapons":
			drawer_content.text = "Collected gear goes here — each item levels up every time it drops again (see Loot Tiers tab in the spreadsheet)."
		"Shop":
			drawer_content.text = "2-3 optional purchases + a 'watch ad for gold' button go here — never pay-to-win."
