// GeoJSON simplified landmass features for high-performance D3 rendering
export const WORLD_GEO_JSON: GeoJSON.FeatureCollection = {
  type: "FeatureCollection",
  features: [
    // Asia-Pacific & East Asia Main
    {
      type: "Feature",
      properties: { name: "East & Southeast Asia Mainland", region: "APAC" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [75.0, 38.0], [85.0, 42.0], [105.0, 42.0], [120.0, 45.0], [130.0, 48.0],
          [132.0, 43.0], [130.0, 38.0], [128.0, 35.0], [126.0, 34.0], [129.0, 35.0],
          [129.5, 37.5], [128.0, 39.0], [124.0, 40.0], [121.0, 39.0], [119.0, 35.0],
          [122.0, 31.0], [120.0, 27.0], [117.0, 23.5], [114.0, 22.3], [108.5, 21.5],
          [106.8, 20.8], [105.8, 19.5], [107.0, 16.5], [108.2, 16.0], [109.3, 13.0],
          [108.0, 11.0], [107.0, 10.3], [104.5, 10.2], [100.5, 7.0], [102.0, 3.0],
          [103.8, 1.3], [101.0, 3.5], [99.0, 7.5], [98.2, 10.0], [100.0, 14.0],
          [98.0, 16.0], [94.0, 16.0], [92.0, 21.0], [89.0, 22.0], [80.0, 16.0],
          [77.5, 8.0], [73.0, 15.0], [68.0, 24.0], [62.0, 25.0], [60.0, 30.0],
          [70.0, 35.0], [75.0, 38.0]
        ]]
      }
    },
    // Korean Peninsula
    {
      type: "Feature",
      properties: { name: "Korean Peninsula", region: "KOREA" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [124.3, 39.8], [126.2, 38.0], [126.5, 37.5], [126.3, 36.5], [126.5, 34.5],
          [127.5, 34.3], [128.8, 34.9], [129.4, 35.5], [129.4, 37.0], [128.5, 38.6],
          [130.5, 42.4], [128.0, 42.0], [125.0, 40.5], [124.3, 39.8]
        ]]
      }
    },
    // Japan
    {
      type: "Feature",
      properties: { name: "Japan Archipelago", region: "JAPAN" },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          // Honshu & Kyushu
          [[
            [130.0, 33.0], [131.0, 34.0], [133.0, 34.5], [136.0, 35.0], [139.0, 35.2],
            [141.0, 38.0], [141.5, 41.0], [139.5, 40.0], [137.0, 37.0], [134.0, 35.5],
            [131.0, 34.0], [129.8, 33.0], [130.0, 31.0], [131.5, 31.5], [130.0, 33.0]
          ]],
          // Hokkaido
          [[
            [140.0, 41.5], [143.0, 42.0], [145.5, 43.5], [143.0, 44.5], [141.0, 45.3],
            [141.5, 43.0], [140.0, 41.5]
          ]]
        ]
      }
    },
    // Vietnam Detailed Coastal Contour
    {
      type: "Feature",
      properties: { name: "Vietnam Industrial Hub", region: "VIETNAM" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [106.0, 23.3], [107.5, 22.0], [108.0, 21.5], [106.8, 20.8], [105.8, 19.8],
          [106.5, 18.0], [107.2, 16.5], [108.2, 16.0], [108.8, 15.0], [109.3, 13.0],
          [109.2, 11.5], [108.0, 10.5], [106.8, 10.2], [105.0, 8.6], [104.5, 10.0],
          [104.8, 10.5], [105.2, 11.0], [106.0, 11.5], [107.5, 12.5], [107.6, 14.5],
          [106.5, 16.0], [105.5, 18.0], [104.5, 19.5], [103.0, 21.5], [104.0, 22.8],
          [106.0, 23.3]
        ]]
      }
    },
    // Taiwan
    {
      type: "Feature",
      properties: { name: "Taiwan", region: "TAIWAN" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [120.0, 22.0], [121.0, 22.5], [122.0, 24.5], [121.5, 25.3], [120.5, 24.5],
          [120.0, 23.0], [120.0, 22.0]
        ]]
      }
    },
    // Philippines
    {
      type: "Feature",
      properties: { name: "Philippines", region: "SE_ASIA" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [120.5, 18.5], [122.0, 18.0], [124.0, 14.0], [126.0, 9.0], [126.0, 6.0],
          [124.5, 6.0], [122.0, 8.0], [120.0, 14.0], [119.5, 16.0], [120.5, 18.5]
        ]]
      }
    },
    // Indonesia & Malaysia / Singapore
    {
      type: "Feature",
      properties: { name: "Indonesia & Maritime SE Asia", region: "SE_ASIA" },
      geometry: {
        type: "MultiPolygon",
        coordinates: [
          // Sumatra
          [[
            [95.5, 5.5], [99.0, 2.0], [104.0, -2.5], [106.0, -5.5], [103.5, -4.5],
            [100.0, -1.0], [97.0, 2.5], [95.5, 5.5]
          ]],
          // Borneo
          [[
            [109.5, 1.5], [114.0, 4.5], [118.0, 5.0], [119.0, 3.5], [117.0, -1.0],
            [114.0, -3.5], [110.5, -2.0], [109.0, 0.0], [109.5, 1.5]
          ]],
          // Java
          [[
            [105.5, -6.0], [110.0, -7.0], [114.5, -8.0], [113.0, -8.5], [108.0, -7.5],
            [105.5, -6.0]
          ]]
        ]
      }
    },
    // Europe Landmass
    {
      type: "Feature",
      properties: { name: "Europe", region: "EMEA" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-10.0, 36.0], [-9.0, 43.0], [-1.0, 46.0], [-4.0, 48.5], [2.0, 51.0],
          [8.0, 54.0], [9.0, 57.0], [13.0, 55.0], [19.0, 54.5], [24.0, 57.0],
          [30.0, 60.0], [40.0, 65.0], [50.0, 55.0], [40.0, 45.0], [30.0, 42.0],
          [24.0, 38.0], [15.0, 38.0], [12.0, 44.0], [4.0, 43.5], [-2.0, 37.0],
          [-10.0, 36.0]
        ]]
      }
    },
    // North America (US West Coast / Long Beach Hub)
    {
      type: "Feature",
      properties: { name: "North America Export Terminal", region: "AMER" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [-125.0, 48.0], [-124.0, 40.0], [-117.0, 32.5], [-115.0, 30.0], [-105.0, 25.0],
          [-97.0, 26.0], [-90.0, 29.5], [-81.0, 25.0], [-75.0, 35.0], [-70.0, 42.0],
          [-65.0, 46.0], [-80.0, 50.0], [-95.0, 50.0], [-115.0, 50.0], [-125.0, 48.0]
        ]]
      }
    }
  ]
};

export interface PlantGeoLocation {
  id: string;
  name: string;
  code: string;
  country: string;
  region: string;
  coordinates: [number, number]; // [Longitude, Latitude]
  status: 'optimal' | 'warning' | 'critical';
  statusText: string;
  oee: number;
  actual: number;
  target: number;
  activeDefectRate: number;
  manager: string;
  lines: number;
  specialty: string;
  bottleneck?: string;
  latencyMs: number;
}

export const SATELLITE_GEO_PLANTS: PlantGeoLocation[] = [
  {
    id: 'KHV',
    name: 'KHV SMT & Assembly',
    code: 'PLANT-01',
    country: 'Vietnam',
    region: 'Bắc Ninh Industrial Zone',
    coordinates: [106.076, 21.186],
    status: 'optimal',
    statusText: 'Vận hành tối ưu',
    oee: 91.2,
    actual: 12800,
    target: 15000,
    activeDefectRate: 0.12,
    manager: 'Trần Văn Hải',
    lines: 8,
    specialty: 'Chuyền SMT & Lắp ráp vi mạch cao tốc',
    latencyMs: 12
  },
  {
    id: 'DREAM_TECH',
    name: 'DREAM TECH Precision',
    code: 'PLANT-02',
    country: 'Vietnam',
    region: 'Hải Phòng VSIP',
    coordinates: [106.688, 20.844],
    status: 'optimal',
    statusText: 'Ổn định',
    oee: 86.4,
    actual: 13000,
    target: 18000,
    activeDefectRate: 0.28,
    manager: 'Park Min Woo',
    lines: 6,
    specialty: 'Đúc vỏ & Ép khuôn chính xác cao',
    latencyMs: 18
  },
  {
    id: 'HSTEC',
    name: 'HSTEC Advanced SMT',
    code: 'PLANT-03',
    country: 'Vietnam',
    region: 'Vĩnh Phúc Khai Quang',
    coordinates: [105.604, 21.308],
    status: 'warning',
    statusText: 'Thiếu 12 thợ SMT ca 1',
    oee: 79.1,
    actual: 12500,
    target: 16000,
    activeDefectRate: 0.45,
    manager: 'Nguyễn Đình Dũng',
    lines: 7,
    specialty: 'Gia công bản mạch SMT nhiều lớp',
    bottleneck: 'Takt-time trượt 6.4s do vắng thợ SMT',
    latencyMs: 22
  },
  {
    id: 'KTECH',
    name: 'KTECH High-Precision CNC',
    code: 'PLANT-04',
    country: 'Vietnam',
    region: 'Bắc Giang Đình Trám',
    coordinates: [106.194, 21.273],
    status: 'warning',
    statusText: 'Cảnh báo rung Spindle 04',
    oee: 65.3,
    actual: 12000,
    target: 20000,
    activeDefectRate: 0.62,
    manager: 'Lê Hoàng Nam',
    lines: 10,
    specialty: 'Cơ khí chính xác & Phay trục CNC đa trục',
    bottleneck: 'Mòn dao Spindle 04, rung 4.2G',
    latencyMs: 31
  },
  {
    id: 'HOJEONGB',
    name: 'HOJEONGB Electronics HQ',
    code: 'PLANT-05',
    country: 'South Korea',
    region: 'Gumi National Industrial Complex',
    coordinates: [128.344, 36.119],
    status: 'optimal',
    statusText: 'Vượt nhịp 104%',
    oee: 93.8,
    actual: 13700,
    target: 15500,
    activeDefectRate: 0.09,
    manager: 'Kim Sung Jae',
    lines: 5,
    specialty: 'Lắp ráp cụm module điện tử & kiểm tra RF',
    latencyMs: 44
  },
  {
    id: 'HOJEONG_VINA',
    name: 'HOJEONG VINA Laser Welding',
    code: 'PLANT-06',
    country: 'Vietnam',
    region: 'Thái Nguyên Yên Bình',
    coordinates: [105.848, 21.594],
    status: 'warning',
    statusText: 'Lệch quang học Laser',
    oee: 80.2,
    actual: 13700,
    target: 18000,
    activeDefectRate: 0.81,
    manager: 'Đặng Tuấn Kiệt',
    lines: 6,
    specialty: 'Hàn laser micro & Xử lý bề mặt quang hóa',
    bottleneck: 'Lệch tọa độ hàn 0.12mm (140 rework)',
    latencyMs: 25
  },
  {
    id: 'DAAL',
    name: 'DAAL Heavy Casting & Ingot',
    code: 'PLANT-07',
    country: 'Vietnam',
    region: 'Đà Nẵng Hòa Khánh',
    coordinates: [108.202, 16.054],
    status: 'critical',
    statusText: 'Đứt phôi nhôm A980',
    oee: 51.4,
    actual: 8600,
    target: 18000,
    activeDefectRate: 1.15,
    manager: 'Vũ Đức Mạnh',
    lines: 8,
    specialty: 'Đúc phôi nhôm & Gia công cơ khí nặng',
    bottleneck: 'Thiếu 3.2 tấn phôi A980 đe dọa chuyến xe TO-3011',
    latencyMs: 56
  }
];

// Global logistics hubs for connection arcs
export const LOGISTICS_HUBS = [
  { name: 'Busan Port (HQ Gateway)', coordinates: [129.075, 35.179] as [number, number], code: 'PUS' },
  { name: 'Hai Phong Port (North Gateway)', coordinates: [106.688, 20.844] as [number, number], code: 'HPH' },
  { name: 'Da Nang Sea Terminal', coordinates: [108.220, 16.068] as [number, number], code: 'DAD' },
  { name: 'Rotterdam Port (EU Export)', coordinates: [4.477, 51.924] as [number, number], code: 'RTM' },
  { name: 'Long Beach Terminal (US Export)', coordinates: [-118.193, 33.770] as [number, number], code: 'LGB' }
];
