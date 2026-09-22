// AV/Robotics Operations Center — shared mock data for the public MPA.
// Same seeded RNG approach as the private repo (mulberry32) so the data
// is deterministic across page loads.

(function (global) {
  function mulberry32(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function pick(rng, arr) { return arr[Math.floor(rng() * arr.length) % arr.length]; }
  function between(rng, min, max) { return min + rng() * (max - min); }
  function betweenInt(rng, min, max) { return Math.floor(between(rng, min, max + 1)); }

  const SEED = 20260922;
  const STATUSES = ['online', 'idle', 'fault', 'offline', 'charging'];

  const VEHICLES = [
    { id: 'veh_01', callsign: 'RVR-01 Atlas', class: 'rover', status: 'charging', battery: 64, lat: 51.4771, lng: -0.0005, heading: 90, speed: 0 },
    { id: 'veh_02', callsign: 'RVR-02 Aurora', class: 'rover', status: 'offline', battery: 44, lat: 51.4755, lng: -0.0012, heading: 145, speed: 0 },
    { id: 'veh_03', callsign: 'DRN-03 Hawk', class: 'drone', status: 'charging', battery: 81, lat: 51.4785, lng: 0.0008, heading: 200, speed: 0 },
    { id: 'veh_04', callsign: 'DRN-04 Falcon', class: 'drone', status: 'online', battery: 66, lat: 51.4762, lng: -0.0018, heading: 78, speed: 42 },
    { id: 'veh_05', callsign: 'TRK-05 Hauler', class: 'truck', status: 'fault', battery: 43, lat: 51.4769, lng: 0.0011, heading: 270, speed: 0 },
    { id: 'veh_06', callsign: 'TRK-06 Convoy', class: 'truck', status: 'fault', battery: 38, lat: 51.4758, lng: -0.0021, heading: 180, speed: 0 },
    { id: 'veh_07', callsign: 'POD-07 Shuttle', class: 'pod', status: 'offline', battery: 27, lat: 51.4779, lng: 0.0005, heading: 0, speed: 0 },
    { id: 'veh_08', callsign: 'POD-08 Caster', class: 'pod', status: 'offline', battery: 60, lat: 51.4765, lng: 0.0014, heading: 90, speed: 0 },
    { id: 'veh_09', callsign: 'RVR-09 Pioneer', class: 'rover', status: 'charging', battery: 39, lat: 51.4781, lng: -0.0009, heading: 315, speed: 0 },
    { id: 'veh_10', callsign: 'DRN-10 Kestrel', class: 'drone', status: 'charging', battery: 55, lat: 51.4773, lng: 0.0021, heading: 120, speed: 0 },
    { id: 'veh_11', callsign: 'TRK-11 Boreas', class: 'truck', status: 'charging', battery: 32, lat: 51.4788, lng: -0.0017, heading: 220, speed: 0 },
    { id: 'veh_12', callsign: 'POD-12 Pixie', class: 'pod', status: 'idle', battery: 67, lat: 51.4767, lng: -0.0003, heading: 45, speed: 0 },
  ];

  const ROBOTS = [
    { id: 'rbt_01', callsign: 'ARM-A1 Forge', class: 'manipulator', status: 'idle', battery: 79, jointCount: 6 },
    { id: 'rbt_02', callsign: 'ARM-A2 Anvil', class: 'manipulator', status: 'fault', battery: 36, jointCount: 6 },
    { id: 'rbt_03', callsign: 'HUM-B1 Echo', class: 'humanoid', status: 'offline', battery: 40, jointCount: 7 },
    { id: 'rbt_04', callsign: 'HUM-B2 Delta', class: 'humanoid', status: 'fault', battery: 46, jointCount: 7 },
    { id: 'rbt_05', callsign: 'AMR-C1 Rover-Mk3', class: 'amr', status: 'charging', battery: 89, jointCount: 0 },
    { id: 'rbt_06', callsign: 'AMR-C2 Scout-Mk2', class: 'amr', status: 'offline', battery: 36, jointCount: 0 },
    { id: 'rbt_07', callsign: 'QUA-D1 Lynx', class: 'quadruped', status: 'online', battery: 38, jointCount: 12 },
    { id: 'rbt_08', callsign: 'QUA-D2 Vixen', class: 'quadruped', status: 'charging', battery: 78, jointCount: 12 },
  ];

  const MISSIONS = [
    { id: 'mis_01', callsign: 'M-001', payload: 'Soil samples (12 tubes)', destination: 'Hangar 7', status: 'active', priority: 'high', waypoints: 3, reached: 0, asset: 'veh_01' },
    { id: 'mis_02', callsign: 'M-002', payload: 'Soil samples (12 tubes)', destination: 'Site Beta', status: 'active', priority: 'low', waypoints: 2, reached: 1, asset: 'rbt_06' },
    { id: 'mis_03', callsign: 'M-003', payload: 'Battery pack exchange', destination: 'Lab B-12', status: 'active', priority: 'critical', waypoints: 2, reached: 1, asset: 'rbt_04' },
    { id: 'mis_04', callsign: 'M-004', payload: 'Soil samples (12 tubes)', destination: 'Hangar 7', status: 'active', priority: 'high', waypoints: 4, reached: 1, asset: 'rbt_01' },
    { id: 'mis_05', callsign: 'M-005', payload: 'Empty return', destination: 'Site Alpha', status: 'active', priority: 'low', waypoints: 4, reached: 1, asset: 'rbt_06' },
    { id: 'mis_06', callsign: 'M-006', payload: 'Hazmat container', destination: 'Hangar 7', status: 'queued', priority: 'high', waypoints: 5, reached: 0, asset: null },
    { id: 'mis_07', callsign: 'M-007', payload: 'Battery pack exchange', destination: 'Depot South', status: 'queued', priority: 'low', waypoints: 4, reached: 0, asset: null },
    { id: 'mis_08', callsign: 'M-008', payload: 'Inspection camera swap', destination: 'Lab B-12', status: 'queued', priority: 'normal', waypoints: 2, reached: 0, asset: null },
    { id: 'mis_09', callsign: 'M-009', payload: 'Sensor calibration rig', destination: 'Lab B-12', status: 'completed', priority: 'critical', waypoints: 4, reached: 4, asset: 'veh_03' },
    { id: 'mis_10', callsign: 'M-010', payload: 'Cargo pallet 240kg', destination: 'Charging Bay 3', status: 'completed', priority: 'low', waypoints: 5, reached: 5, asset: 'veh_10' },
  ];

  const KNOWLEDGE = [
    { id: 'kb_lidar', title: 'LiDAR Point Cloud Fusion', category: 'Perception', summary: 'Combining multiple LiDAR units into a single, ego-motion-compensated point cloud.', relatedCodes: ['LIDAR_DRIFT', 'IMU_SAT'] },
    { id: 'kb_camera', title: 'Camera Confidence Scoring', category: 'Perception', summary: 'How the perception stack expresses uncertainty in detected objects.', relatedCodes: ['CAM_CONF_LOW'] },
    { id: 'kb_imu', title: 'IMU Saturation', category: 'Perception', summary: 'What happens when the inertial measurement unit reports values beyond its measurement range.', relatedCodes: ['IMU_SAT', 'LIDAR_DRIFT'] },
    { id: 'kb_gps', title: 'GPS Fix Loss', category: 'Comms', summary: 'Why GNSS fix can be lost in urban canyons, tunnels, and under heavy canopy.', relatedCodes: ['GPS_DROP'] },
    { id: 'kb_battery', title: 'Battery Depth-of-Discharge Limits', category: 'Power', summary: 'Why the platform reports a fault at 10% state-of-charge.', relatedCodes: ['BAT_LOW'] },
    { id: 'kb_joint_temp', title: 'Joint Thermal Management', category: 'Actuation', summary: 'How joint temperature limits interact with motion planning.', relatedCodes: ['JOINT_TEMP'] },
    { id: 'kb_comms_retry', title: 'Communication Retry Storms', category: 'Comms', summary: 'Why a moderate packet-loss rate can produce a disproportionate number of retries.', relatedCodes: ['COMM_RETRY'] },
    { id: 'kb_traj_opt', title: 'Trajectory Optimization', category: 'Planning', summary: 'How the planner converts a sequence of waypoints into a smooth trajectory.', relatedCodes: [] },
    { id: 'kb_mpc', title: 'Model Predictive Control', category: 'Control', summary: 'How MPC balances tracking accuracy against comfort and constraint satisfaction.', relatedCodes: [] },
    { id: 'kb_fail_safe', title: 'Fail-Safe States', category: 'Safety', summary: 'The taxonomy of fail-safe states the platform can enter.', relatedCodes: ['BAT_LOW', 'GPS_DROP', 'IMU_SAT'] },
    { id: 'kb_gripper', title: 'End-Effector Force Control', category: 'Actuation', summary: 'How the gripper decides how hard to squeeze.', relatedCodes: [] },
    { id: 'kb_odd', title: 'Operational Design Domain', category: 'Safety', summary: 'The ODD defines the conditions under which autonomous operation is permitted.', relatedCodes: [] },
  ];

  const ALERTS = [
    { id: 'alt_01', code: 'GPS_DROP', severity: 'critical', message: 'GPS fix lost for 18 seconds', assetId: 'veh_08', raisedAt: 55 * 60 * 1000, acked: false },
    { id: 'alt_02', code: 'BAT_LOW', severity: 'critical', message: 'Battery voltage dropped below safe threshold', assetId: 'rbt_03', raisedAt: 53 * 60 * 1000, acked: false },
    { id: 'alt_03', code: 'CAM_CONF_LOW', severity: 'warning', message: 'Camera confidence below 0.4 in low-light segment', assetId: 'veh_12', raisedAt: 46 * 60 * 1000, acked: false },
    { id: 'alt_04', code: 'LIDAR_DRIFT', severity: 'warning', message: 'LiDAR point cloud drift detected on front unit', assetId: 'veh_09', raisedAt: 26 * 60 * 1000, acked: false },
    { id: 'alt_05', code: 'IMU_SAT', severity: 'warning', message: 'IMU accelerometer saturated during maneuver', assetId: 'veh_02', raisedAt: 8 * 60 * 1000, acked: false },
    { id: 'alt_06', code: 'JOINT_TEMP', severity: 'info', message: 'Joint 3 temperature exceeded 78°C', assetId: 'rbt_02', raisedAt: 39 * 60 * 1000, acked: true },
    { id: 'alt_07', code: 'COMM_RETRY', severity: 'info', message: 'Communication retries above 5%', assetId: 'veh_05', raisedAt: 26 * 60 * 1000, acked: false },
    { id: 'alt_08', code: 'TIRE_PRESS', severity: 'info', message: 'Tire pressure nominal but trending low', assetId: 'veh_09', raisedAt: 18 * 60 * 1000, acked: false },
  ];

  const MAINTENANCE = [
    { id: 'mnt_01', task: 'Tire replacement', assetId: 'veh_08', dueKm: 3292, status: 'overdue' },
    { id: 'mnt_02', task: 'Gripper pad swap', assetId: 'rbt_04', dueKm: 4581, status: 'due' },
    { id: 'mnt_03', task: 'Coolant flush', assetId: 'rbt_07', dueKm: 459, status: 'overdue' },
    { id: 'mnt_04', task: 'Coolant flush', assetId: 'rbt_05', dueKm: 2061, status: 'scheduled' },
    { id: 'mnt_05', task: 'Gripper pad swap', assetId: 'veh_09', dueKm: 690, status: 'scheduled' },
    { id: 'mnt_06', task: 'Gripper pad swap', assetId: 'rbt_01', dueKm: 151, status: 'due' },
    { id: 'mnt_07', task: 'Tire replacement', assetId: 'veh_09', dueKm: 1280, status: 'overdue' },
    { id: 'mnt_08', task: 'Drivetrain inspection', assetId: 'rbt_05', dueKm: 3512, status: 'due' },
  ];

  // Perception snapshot (static)
  const PERCEPTION = {
    sensors: [
      { modality: 'lidar', driftUs: 48, fps: 20, health: 'nominal', degrade: 'none', points: 27514 },
      { modality: 'radar', driftUs: 34, fps: 25, health: 'nominal', degrade: 'none', points: 712 },
      { modality: 'rgbd', driftUs: 142, fps: 30, health: 'nominal', degrade: 'rain', points: 201117 },
      { modality: 'ultrasonic', driftUs: 150, fps: 15, health: 'nominal', degrade: 'rain', points: 150 },
    ],
    objects: [
      { id: 'obj_01', class: 'vehicle', pos: [42.8, 0.7], vel: [1.5, 0.8], conf: 0.65, filter: 'UKF', age: 11.9 },
      { id: 'obj_02', class: 'cyclist', pos: [20.1, -4.2], vel: [8.0, -3.0], conf: 0.64, filter: 'EKF', age: 12.2 },
      { id: 'obj_03', class: 'debris', pos: [22.6, 3.1], vel: [-6.2, 2.7], conf: 0.57, filter: 'EKF', age: 15.1 },
      { id: 'obj_04', class: 'pedestrian', pos: [9.7, -2.5], vel: [-1.0, -0.9], conf: 0.58, filter: 'UKF', age: 11.2 },
      { id: 'obj_05', class: 'vehicle', pos: [-17.7, 6.2], vel: [2.4, -0.4], conf: 0.62, filter: 'EKF', age: 9.8 },
      { id: 'obj_06', class: 'cyclist', pos: [-14.8, 5.2], vel: [3.1, 2.3], conf: 0.95, filter: 'EKF', age: 15.3 },
      { id: 'obj_07', class: 'vehicle', pos: [28.6, 3.8], vel: [-6.0, -2.0], conf: 0.73, filter: 'EKF', age: 10.6 },
      { id: 'obj_08', class: 'cyclist', pos: [37.5, -5.1], vel: [12.3, -0.5], conf: 0.89, filter: 'EKF', age: 0.7 },
    ],
  };

  // V2X snapshot
  const V2X = {
    peers: [
      { id: 'peer_01', x: -25, y: 8, vel: 12.5, heading: 90, intent: 'lane_keep', rssi: -52 },
      { id: 'peer_02', x: 32, y: -12, vel: 18.2, heading: 270, intent: 'merge_left', rssi: -67 },
      { id: 'peer_03', x: -8, y: 22, vel: 8.0, heading: 180, intent: 'exit_ramp', rssi: -71 },
      { id: 'peer_04', x: 18, y: 18, vel: 15.3, heading: 90, intent: 'lane_keep', rssi: -58 },
      { id: 'peer_05', x: -32, y: -16, vel: 22.0, heading: 0, intent: 'merge_right', rssi: -83 },
      { id: 'peer_06', x: 25, y: 5, vel: 10.8, heading: 135, intent: 'lane_keep', rssi: -64 },
    ],
    v2i: { lightId: 'tl_north_03', phase: 'green', secToChange: 8, recSpeed: 42 },
    consensus: { id: 'prop_0042', proposer: 'peer_03', action: 'zipper_merge', for: 5, against: 1, quorum: 5, committed: false },
    crypto: [
      { ts: -2, peer: 'peer_01', sig: 'valid', hsm: true },
      { ts: -5, peer: 'peer_03', sig: 'valid', hsm: true },
      { ts: -8, peer: 'peer_05', sig: 'revoked', hsm: true },
      { ts: -12, peer: 'peer_02', sig: 'valid', hsm: true },
      { ts: -15, peer: 'peer_06', sig: 'unknown', hsm: false },
      { ts: -19, peer: 'peer_04', sig: 'valid', hsm: true },
    ],
  };

  global.MockData = {
    vehicles: VEHICLES,
    robots: ROBOTS,
    fleet: [...VEHICLES, ...ROBOTS],
    missions: MISSIONS,
    knowledge: KNOWLEDGE,
    alerts: ALERTS,
    maintenance: MAINTENANCE,
    perception: PERCEPTION,
    v2x: V2X,
    contactEmail: 'testdemoqwenai2025-creator@users.noreply.github.com',
  };
})(window);
