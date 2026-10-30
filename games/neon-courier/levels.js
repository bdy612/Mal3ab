'use strict';
// =====================================================================
// Neon Courier: Zero-G — hand-made levels.
// Coordinates are in tiles (1 tile = 40 world units). Each map starts as solid metal:
//   carve(x, y, w, h)  opens space · wall()/glass() fill it again (glass = slick, no hook, no mag)
//   slope(x, y, k)      45° ramp; k = the solid corner: 1 bottom-left, 2 bottom-right, 3 top-left, 4 top-right
//   start / term(x, y, mountDir) / anchor(x, y) / fuel(cellX, cellY, wallSide)
//   laser(cellX, cellY, beamDir, { len, cycle: [on, off], phase })   fan(cellX, cellY, blowDir, width, { len, power, cycle })
//   spin(x, y, { len, speed, arms })  rot(x, y, { len, speed, arms }) = rotating laser
//   drone(x1, y1, x2, y2, { period, phase })  door(x, y, w, h, 'A' | 'B')  sign(x, y, key)
// Level options: fuel (tank size), fragile, hot (timed), par (medal-time multiplier), doorPeriod
// =====================================================================
window.NC_LEVELS = [
  // 1 — thrusters, drifting, braking, fuel, delivery
  { name: 'nc_l1', w: 49, h: 24, fuel: 100, par: 1.25, build(m) {
    m.carve(2, 9, 9, 8);            // start bay
    m.carve(11, 11, 20, 4);         // corridor
    m.carve(31, 4, 12, 17);         // hall
    m.carve(43, 4, 4, 4);           // exit to the terminal
    m.slope(31, 4, 3); m.slope(31, 20, 1); m.slope(42, 20, 2);
    m.start(5, 13);
    m.fuel(36, 20, 'd');
    m.term(46.6, 6, 'r');
    m.sign(6.5, 10.4, 'nc_s1a');
    m.sign(21, 12.2, 'nc_s1b', { w: 9 });
    m.sign(36.5, 17.6, 'nc_s1c');
    m.sign(36.5, 8.5, 'nc_s1d');
  } },
  // 2 — the grappling hook: swing round corner rings
  { name: 'nc_l2', w: 49, h: 34, fuel: 45, par: 1.25, build(m) {
    m.carve(2, 2, 7, 6);            // bay
    m.carve(9, 3, 38, 4);           // corridor A (centre y 5)
    m.carve(43, 7, 4, 14);          // shaft B (centre x 45)
    m.carve(13, 17, 30, 4);         // corridor C (centre y 19)
    m.carve(2, 14, 11, 19);         // chamber D
    m.carve(13, 27, 20, 4);         // corridor E (centre y 29)
    m.start(4.5, 5);
    m.anchor(43.3, 6.7); m.anchor(43.3, 17.3); m.anchor(8, 24);
    m.term(32.6, 29, 'r');
    m.sign(5.5, 2.9, 'nc_s2a', { w: 6.5 });
    m.sign(27, 4.0, 'nc_s2b', { w: 12 });
    m.sign(26, 18.0, 'nc_s2c', { w: 12 });
  } },
  // 3 — magnetic boots: stick, run and kick up a tall shaft
  { name: 'nc_l3', w: 25, h: 47, fuel: 12, par: 1.35, build(m) {
    m.carve(4, 8, 10, 38);          // tall shaft
    m.carve(14, 8, 9, 4);           // exit corridor
    m.glass(3, 27, 1, 7); m.glass(14, 17, 1, 7);
    m.wall(10, 36, 4, 1); m.wall(4, 22, 3, 1);
    m.start(4.4, 43.5);
    m.term(22.6, 10, 'r');
    m.sign(9, 42.4, 'nc_s3a', { w: 8 });
    m.sign(8.5, 33, 'nc_s3b', { w: 8 });
    m.sign(9, 25.5, 'nc_s3c', { w: 7.5 });
  } },
  // 4 — reeling in and out over tall pillars
  { name: 'nc_l4', w: 60, h: 30, fuel: 30, par: 1.3, build(m) {
    m.carve(2, 2, 56, 26);
    m.glass(2, 1, 56, 1); m.glass(2, 28, 56, 1);
    m.wall(14, 11, 3, 17); m.wall(30, 2, 3, 16); m.wall(44, 12, 3, 16);
    m.start(5, 24);
    m.anchor(8, 13); m.anchor(15.5, 6); m.anchor(31.5, 22.5); m.anchor(45.5, 6.5);
    m.fuel(23, 27, 'd');
    m.term(57.6, 24, 'r');
    m.sign(7, 17, 'nc_s4a', { w: 9 });
    m.sign(23, 23.5, 'nc_s4b', { w: 8 });
  } },
  // 5 — fragile cargo through a winding vent
  { name: 'nc_l5', w: 46, h: 34, fuel: 70, fragile: true, par: 1.35, build(m) {
    m.carve(2, 2, 7, 6);
    m.carve(9, 3, 27, 3);           // c1
    m.carve(33, 6, 3, 10);          // d1
    m.carve(14, 13, 19, 3);         // c2
    m.carve(14, 16, 3, 10);         // d2
    m.carve(17, 23, 26, 3);         // c3
    m.carve(40, 26, 3, 6);          // d3
    m.slope(35, 3, 4); m.slope(35, 15, 2); m.slope(14, 13, 3); m.slope(14, 25, 1); m.slope(42, 23, 4);
    m.start(4.5, 4.5);
    m.anchor(33.25, 6.75); m.anchor(33.25, 12.75); m.anchor(16.75, 16.25); m.anchor(16.75, 22.75); m.anchor(39.75, 26.25);
    m.fuel(25, 15, 'd');
    m.term(41.5, 31.6, 'd');
    m.sign(5.5, 3.2, 'nc_s5a', { w: 6.5 });
  } },
  // 6 — lasers: static, blinking and the rope-cutting slalom
  { name: 'nc_l6', w: 62, h: 28, fuel: 60, par: 1.4, build(m) {
    m.carve(2, 10, 8, 8);
    m.carve(10, 11, 20, 6);
    m.wall(18, 13, 8, 2);
    m.carve(30, 4, 16, 22);
    m.carve(46, 4, 14, 4);
    m.start(5, 13.5);
    m.laser(14, 11, 'd', { cycle: [1.3, 1.3] });
    m.laser(21, 11, 'd');
    m.laser(23, 16, 'u', { cycle: [1.1, 1.1], phase: 0.6 });
    m.laser(34, 4, 'd', { len: 12 }); m.laser(38, 25, 'u', { len: 12 }); m.laser(42, 4, 'd', { len: 12 });
    m.laser(53, 4, 'd', { cycle: [1, 1.4] });
    m.anchor(36, 22); m.anchor(40, 7); m.anchor(44, 22);
    m.fuel(31, 25, 'd');
    m.term(59.6, 6, 'r');
    m.sign(6, 11.2, 'nc_s6a', { w: 6.5 });
    m.sign(36, 6.5, 'nc_s6b', { w: 7 });
  } },
  // 7 — fans: an elevator, a down-blower and a headwind
  { name: 'nc_l7', w: 56, h: 47, fuel: 50, par: 1.4, build(m) {
    m.carve(2, 39, 10, 6);
    m.carve(12, 6, 6, 39);
    m.carve(18, 6, 20, 4);
    m.carve(34, 10, 4, 18);
    m.carve(38, 24, 16, 4);
    m.fan(12, 44, 'u', 6, { len: 20, power: 1500 });
    m.fan(24, 6, 'd', 3, { cycle: [1.6, 1.6], power: 1800 });
    m.fan(34, 27, 'u', 4, { cycle: [1.6, 2.2], power: 950, len: 12 });
    m.fan(34, 24, 'r', 4, { len: 20, power: 900 });
    m.anchor(17.7, 9.7); m.anchor(33.7, 9.7); m.anchor(38.3, 23.7);
    m.fuel(30, 6, 'u');
    m.start(5, 42);
    m.term(53.6, 26, 'r');
    m.sign(6.5, 40.2, 'nc_s7a', { w: 8 });
    m.sign(28, 9.0, 'nc_s7b', { w: 9 });
  } },
  // 8 — hot noodles: a timed race round a big loop
  { name: 'nc_l8', w: 70, h: 40, fuel: 70, hot: true, par: 1.25, build(m) {
    m.carve(2, 2, 66, 6);
    m.carve(62, 8, 6, 30);
    m.carve(2, 32, 60, 6);
    m.carve(2, 14, 6, 18);
    m.carve(8, 14, 40, 6);
    m.anchor(62.3, 7.7); m.anchor(62.3, 32.3); m.anchor(7.7, 32.3); m.anchor(7.7, 19.7);
    m.fan(67, 32, 'l', 6, { len: 34, power: 700 });
    m.laser(30, 2, 'd', { len: 3 }); m.laser(40, 7, 'u', { len: 3 }); m.laser(50, 2, 'd', { len: 3 });
    m.laser(30, 14, 'd', { cycle: [1.2, 1.2] });
    m.fuel(20, 7, 'd'); m.fuel(40, 37, 'd'); m.fuel(2, 24, 'l');
    m.start(4.5, 5);
    m.term(47.6, 17, 'r');
    m.sign(11, 3.2, 'nc_s8a', { w: 8 });
  } },
  // 9 — the grinder: spinning machinery
  { name: 'nc_l9', w: 60, h: 30, fuel: 60, par: 1.45, build(m) {
    m.carve(2, 11, 8, 8);
    m.carve(10, 7, 16, 16);
    m.carve(26, 13, 6, 4);
    m.carve(32, 3, 16, 24);
    m.carve(48, 3, 6, 4);
    m.carve(54, 3, 4, 24);
    m.spin(18, 15, { len: 6.3, speed: 1.1, arms: 2 });
    m.spin(40, 10, { len: 5, speed: -1.4, arms: 3 });
    m.spin(40, 20.5, { len: 5, speed: 1.4, arms: 3 });
    m.laser(54, 15, 'r', { cycle: [1.2, 1.2] });
    m.anchor(11.3, 8.3); m.anchor(24.7, 8.3); m.anchor(11.3, 21.7); m.anchor(24.7, 21.7); m.anchor(33.3, 4.3); m.anchor(46.7, 25.7);
    m.fuel(36, 26, 'd');
    m.start(5, 15);
    m.term(55.5, 26.6, 'd');
    m.sign(5.8, 11.6, 'nc_s9a', { w: 7 });
  } },
  // 10 — airlock doors on a cycle, or the laser vent above
  { name: 'nc_l10', w: 62, h: 18, fuel: 60, par: 1.6, doorPeriod: 3.4, build(m) {
    m.carve(2, 8, 8, 8);
    m.carve(10, 9, 50, 6);
    m.carve(10, 3, 50, 3);
    m.carve(12, 6, 2, 3); m.carve(56, 6, 2, 3);
    m.door(18, 9, 1, 6, 'A'); m.door(28, 9, 1, 6, 'B'); m.door(38, 9, 1, 6, 'A'); m.door(48, 9, 1, 6, 'B');
    m.laser(20, 3, 'd', { len: 1.6 }); m.laser(26, 5, 'u', { len: 1.6 }); m.laser(32, 3, 'd', { len: 1.6 });
    m.laser(38, 5, 'u', { len: 1.6 }); m.laser(44, 3, 'd', { len: 1.6 }); m.laser(50, 5, 'u', { len: 1.6 });
    m.fuel(33, 14, 'd');
    m.start(5, 12);
    m.term(59.6, 12, 'r');
    m.sign(6, 9.0, 'nc_s10a', { w: 7 });
    m.sign(23, 6.9, 'nc_s10b', { w: 8 });
  } },
  // 11 — drone alley: patrols to time
  { name: 'nc_l11', w: 58, h: 31, fuel: 60, par: 1.5, build(m) {
    m.carve(2, 2, 8, 6);
    m.carve(10, 2, 40, 6);
    m.carve(50, 2, 6, 26);
    m.carve(18, 21, 32, 8);
    m.drone(18, 2.6, 18, 7.4, { period: 2.2 });
    m.drone(26, 2.6, 26, 7.4, { period: 1.8, phase: 0.5 });
    m.drone(34, 2.6, 34, 7.4, { period: 2.6, phase: 1 });
    m.drone(42, 2.6, 42, 7.4, { period: 1.6, phase: 0.3 });
    m.drone(50.6, 12, 55.4, 12, { period: 1.6 });
    m.drone(50.6, 17, 55.4, 17, { period: 2, phase: 0.8 });
    m.drone(46, 22, 22, 28, { period: 5 });
    m.drone(46, 28, 22, 22, { period: 5, phase: 1.2 });
    m.anchor(50.3, 7.7); m.anchor(50.3, 21.3);
    m.fuel(30, 7, 'd');
    m.start(5, 4.5);
    m.term(18.4, 25, 'l');
    m.sign(6, 2.9, 'nc_s11a', { w: 7 });
  } },
  // 12 — slingshot: a huge hall, a rotating laser and lots of rings
  { name: 'nc_l12', w: 70, h: 44, fuel: 50, par: 1.35, build(m) {
    m.carve(2, 2, 66, 40);
    m.glass(2, 1, 66, 1); m.glass(2, 42, 66, 1);
    m.wall(18, 2, 4, 15); m.wall(18, 27, 4, 15);
    m.wall(52, 2, 2, 31);
    m.rot(36, 22, { len: 11, speed: 0.55, arms: 2 });
    m.anchor(10, 10); m.anchor(10, 34); m.anchor(28, 7); m.anchor(28, 37); m.anchor(44, 7); m.anchor(44, 37);
    m.anchor(58, 38); m.anchor(61, 24); m.anchor(61, 11);
    m.fuel(2, 22, 'l');
    m.start(5, 22);
    m.term(67.6, 5, 'r');
    m.sign(8, 17.5, 'nc_s12a', { w: 8 });
  } },
  // 13 — glass maze with fragile cargo
  { name: 'nc_l13', w: 56, h: 40, fuel: 50, fragile: true, par: 1.4, build(m) {
    m.carve(2, 2, 52, 36);
    m.glass(10, 2, 2, 24); m.glass(20, 14, 2, 24); m.glass(30, 2, 2, 24); m.glass(40, 14, 2, 24);
    m.anchor(11, 29.5); m.anchor(21, 10.5); m.anchor(31, 29.5); m.anchor(41, 10.5);
    m.fan(22, 37, 'u', 8, { cycle: [1.8, 2.2], power: 1100, len: 14 });
    m.laser(2, 19, 'r', { len: 5 });
    m.laser(53, 21, 'l', { len: 5 });
    m.fuel(25, 2, 'u');
    m.start(5, 5);
    m.term(53.6, 34, 'r');
    m.sign(6, 3.0, 'nc_s13a', { w: 7 });
  } },
  // 14 — core breach: doors, grinders, a laser gate and drones against the clock
  { name: 'nc_l14', w: 72, h: 34, fuel: 60, hot: true, par: 1.5, doorPeriod: 2.8, build(m) {
    m.carve(2, 13, 8, 8);
    m.carve(10, 14, 14, 6);
    m.door(14, 14, 1, 6, 'A'); m.door(20, 14, 1, 6, 'B');
    m.carve(24, 7, 16, 20);
    m.spin(32, 12, { len: 4, speed: 1.8, arms: 2 });
    m.spin(32, 22, { len: 4, speed: -1.8, arms: 2 });
    m.carve(40, 14, 10, 6);
    m.laser(45, 14, 'd', { cycle: [1.1, 1.1] });
    m.carve(50, 3, 6, 17);
    m.drone(50.6, 13, 55.4, 13, { period: 1.7 });
    m.drone(50.6, 8, 55.4, 8, { period: 2.1, phase: 0.7 });
    m.carve(56, 3, 14, 5);
    m.laser(62, 3, 'd', { len: 2.4 }); m.laser(66, 7, 'u', { len: 2.4 });
    m.anchor(25.3, 8.3); m.anchor(38.7, 25.7); m.anchor(50.3, 14.3); m.anchor(55.7, 8.7);
    m.fuel(26, 26, 'd');
    m.start(5, 17);
    m.term(69.6, 5, 'r');
    m.sign(6, 14, 'nc_s14a', { w: 7 });
  } },
  // 15 — zero hour: fragile AND hot, everything at once
  { name: 'nc_l15', w: 60, h: 44, fuel: 60, fragile: true, hot: true, par: 1.55, doorPeriod: 3.2, build(m) {
    m.carve(2, 34, 9, 7);
    m.carve(11, 35, 23, 5);
    m.door(18, 35, 1, 5, 'A'); m.door(26, 35, 1, 5, 'B');
    m.carve(34, 20, 22, 21);
    m.rot(44, 30, { len: 7.5, speed: 0.7, arms: 2 });
    m.carve(50, 4, 6, 16);
    m.drone(50.6, 15, 55.4, 15, { period: 1.9 });
    m.drone(50.6, 10, 55.4, 10, { period: 1.5, phase: 0.6 });
    m.carve(14, 4, 36, 5);
    m.glass(14, 3, 36, 1); m.glass(14, 9, 36, 1);
    m.spin(36, 4.2, { len: 3, speed: 1.6, arms: 3 });
    m.laser(26, 8, 'u', { len: 2.5, cycle: [1.2, 1] });
    m.anchor(51.5, 38); m.anchor(53.5, 23); m.anchor(50.3, 8.7); m.anchor(36.5, 37.5);
    m.fuel(40, 40, 'd');
    m.start(5, 37.5);
    m.term(14.4, 6, 'l');
    m.sign(6.5, 34.9, 'nc_s15a', { w: 7.5 });
  } },
];
