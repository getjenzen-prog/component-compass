// Seeded mock supply chain dataset for the Helix dashboard.
// Risk scores derived from on-hand stock, lead time, and supplier concentration.

export type Category = "MCU" | "Passive" | "Connector" | "Memory" | "Power" | "Sensor";
export type Region = "US" | "EU" | "Asia";
export type RiskLevel = "healthy" | "watch" | "critical";

export interface Supplier {
  id: string;
  name: string;
  region: Region;
  reliability: number; // 0-100
  onTimePct: number; // 0-100
  leadTimeWeeks: number;
}

export interface Component {
  id: string;
  mpn: string;
  manufacturer: string;
  category: Category;
  description: string;
  onHand: number;
  weeklyUsage: number;
  leadTimeWeeks: number;
  unitPrice: number;
  supplierIds: string[];
  stockHistory: number[]; // last 30 days
}

export const suppliers: Supplier[] = [
  { id: "s1", name: "Avnet", region: "US", reliability: 92, onTimePct: 96, leadTimeWeeks: 8 },
  { id: "s2", name: "Arrow Electronics", region: "US", reliability: 89, onTimePct: 94, leadTimeWeeks: 9 },
  { id: "s3", name: "Digi-Key", region: "US", reliability: 97, onTimePct: 99, leadTimeWeeks: 2 },
  { id: "s4", name: "Mouser", region: "US", reliability: 96, onTimePct: 98, leadTimeWeeks: 2 },
  { id: "s5", name: "Future Electronics", region: "EU", reliability: 84, onTimePct: 88, leadTimeWeeks: 12 },
  { id: "s6", name: "Rutronik", region: "EU", reliability: 86, onTimePct: 90, leadTimeWeeks: 10 },
  { id: "s7", name: "Farnell", region: "EU", reliability: 91, onTimePct: 93, leadTimeWeeks: 4 },
  { id: "s8", name: "WPG Holdings", region: "Asia", reliability: 78, onTimePct: 82, leadTimeWeeks: 14 },
  { id: "s9", name: "Macnica", region: "Asia", reliability: 83, onTimePct: 87, leadTimeWeeks: 11 },
  { id: "s10", name: "Shenzhen LCSC", region: "Asia", reliability: 81, onTimePct: 85, leadTimeWeeks: 6 },
  { id: "s11", name: "Marubun", region: "Asia", reliability: 88, onTimePct: 91, leadTimeWeeks: 9 },
  { id: "s12", name: "TTI Inc.", region: "US", reliability: 90, onTimePct: 93, leadTimeWeeks: 7 },
];

// helper: pseudo-random sparkline
function spark(seed: number, base: number, vol = 0.15): number[] {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < 30; i++) {
    const r = Math.sin(seed * 13.7 + i * 1.9) * 0.5 + Math.cos(seed * 7.1 + i * 0.7) * 0.5;
    v = Math.max(0, v * (1 + r * vol));
    out.push(Math.round(v));
  }
  return out;
}

export const components: Component[] = [
  // MCUs
  { id: "c1", mpn: "STM32H743ZIT6", manufacturer: "STMicro", category: "MCU", description: "ARM Cortex-M7 480MHz", onHand: 1240, weeklyUsage: 180, leadTimeWeeks: 22, unitPrice: 14.5, supplierIds: ["s1", "s8"], stockHistory: spark(1, 1500) },
  { id: "c2", mpn: "ATSAMD21G18A", manufacturer: "Microchip", category: "MCU", description: "Cortex-M0+ 48MHz", onHand: 320, weeklyUsage: 220, leadTimeWeeks: 28, unitPrice: 4.2, supplierIds: ["s8"], stockHistory: spark(2, 800) },
  { id: "c3", mpn: "ESP32-WROOM-32E", manufacturer: "Espressif", category: "MCU", description: "Wi-Fi/BT module", onHand: 4800, weeklyUsage: 320, leadTimeWeeks: 6, unitPrice: 3.8, supplierIds: ["s10", "s4"], stockHistory: spark(3, 4500) },
  { id: "c4", mpn: "RP2040", manufacturer: "Raspberry Pi", category: "MCU", description: "Dual Cortex-M0+ 133MHz", onHand: 6200, weeklyUsage: 410, leadTimeWeeks: 4, unitPrice: 1.0, supplierIds: ["s3", "s4", "s10"], stockHistory: spark(4, 6000) },
  { id: "c5", mpn: "NRF52840-QIAA", manufacturer: "Nordic", category: "MCU", description: "BLE 5 SoC", onHand: 180, weeklyUsage: 95, leadTimeWeeks: 26, unitPrice: 7.9, supplierIds: ["s5"], stockHistory: spark(5, 600) },
  { id: "c6", mpn: "STM32G031K8T6", manufacturer: "STMicro", category: "MCU", description: "Cortex-M0+ 64MHz", onHand: 2400, weeklyUsage: 140, leadTimeWeeks: 14, unitPrice: 1.6, supplierIds: ["s1", "s7"], stockHistory: spark(6, 2600) },

  // Passives
  { id: "c7", mpn: "GRM188R71H104KA93D", manufacturer: "Murata", category: "Passive", description: "100nF 0603 X7R", onHand: 124000, weeklyUsage: 8200, leadTimeWeeks: 8, unitPrice: 0.012, supplierIds: ["s9", "s11"], stockHistory: spark(7, 130000) },
  { id: "c8", mpn: "CL10A106KP8NNNC", manufacturer: "Samsung", category: "Passive", description: "10µF 0603 X5R", onHand: 38000, weeklyUsage: 6400, leadTimeWeeks: 10, unitPrice: 0.018, supplierIds: ["s10"], stockHistory: spark(8, 50000) },
  { id: "c9", mpn: "RC0603FR-0710KL", manufacturer: "Yageo", category: "Passive", description: "10kΩ 0603 1%", onHand: 215000, weeklyUsage: 12000, leadTimeWeeks: 4, unitPrice: 0.004, supplierIds: ["s3", "s4"], stockHistory: spark(9, 220000) },
  { id: "c10", mpn: "LQM21PN1R0NGRD", manufacturer: "Murata", category: "Passive", description: "1µH 0805 inductor", onHand: 4200, weeklyUsage: 1100, leadTimeWeeks: 12, unitPrice: 0.08, supplierIds: ["s9"], stockHistory: spark(10, 6000) },
  { id: "c11", mpn: "CRCW04021K00FKED", manufacturer: "Vishay", category: "Passive", description: "1kΩ 0402 1%", onHand: 88000, weeklyUsage: 5400, leadTimeWeeks: 6, unitPrice: 0.005, supplierIds: ["s4", "s7"], stockHistory: spark(11, 90000) },
  { id: "c12", mpn: "B82432A1104K000", manufacturer: "TDK", category: "Passive", description: "100µH SMD inductor", onHand: 920, weeklyUsage: 280, leadTimeWeeks: 18, unitPrice: 0.42, supplierIds: ["s5", "s11"], stockHistory: spark(12, 1400) },

  // Connectors
  { id: "c13", mpn: "USB4105-GF-A", manufacturer: "GCT", category: "Connector", description: "USB-C receptacle 24p", onHand: 1800, weeklyUsage: 240, leadTimeWeeks: 16, unitPrice: 0.85, supplierIds: ["s8"], stockHistory: spark(13, 2200) },
  { id: "c14", mpn: "47346-1001", manufacturer: "Molex", category: "Connector", description: "microSD push-push", onHand: 640, weeklyUsage: 120, leadTimeWeeks: 14, unitPrice: 1.2, supplierIds: ["s1", "s2"], stockHistory: spark(14, 900) },
  { id: "c15", mpn: "DF13-10P-1.25DSA", manufacturer: "Hirose", category: "Connector", description: "10-pin 1.25mm header", onHand: 3400, weeklyUsage: 410, leadTimeWeeks: 10, unitPrice: 0.32, supplierIds: ["s9", "s11"], stockHistory: spark(15, 3800) },
  { id: "c16", mpn: "PJ-031D", manufacturer: "CUI", category: "Connector", description: "Barrel jack 2.1mm", onHand: 5200, weeklyUsage: 280, leadTimeWeeks: 6, unitPrice: 0.28, supplierIds: ["s3", "s4"], stockHistory: spark(16, 5400) },
  { id: "c17", mpn: "53261-0871", manufacturer: "Molex", category: "Connector", description: "PicoBlade 8-pin", onHand: 280, weeklyUsage: 160, leadTimeWeeks: 20, unitPrice: 0.55, supplierIds: ["s2"], stockHistory: spark(17, 800) },
  { id: "c18", mpn: "RJHSE5380", manufacturer: "Amphenol", category: "Connector", description: "RJ45 magjack", onHand: 1100, weeklyUsage: 90, leadTimeWeeks: 12, unitPrice: 2.4, supplierIds: ["s12"], stockHistory: spark(18, 1300) },

  // Memory
  { id: "c19", mpn: "MT41K256M16TW-107", manufacturer: "Micron", category: "Memory", description: "DDR3L 4Gb 1866", onHand: 420, weeklyUsage: 110, leadTimeWeeks: 24, unitPrice: 4.2, supplierIds: ["s1", "s8"], stockHistory: spark(19, 700) },
  { id: "c20", mpn: "W25Q128JVSIQ", manufacturer: "Winbond", category: "Memory", description: "128Mb SPI NOR flash", onHand: 1900, weeklyUsage: 240, leadTimeWeeks: 12, unitPrice: 1.4, supplierIds: ["s10", "s4"], stockHistory: spark(20, 2400) },
  { id: "c21", mpn: "S34ML01G200TFI000", manufacturer: "Cypress", category: "Memory", description: "1Gb SLC NAND", onHand: 95, weeklyUsage: 60, leadTimeWeeks: 30, unitPrice: 5.8, supplierIds: ["s5"], stockHistory: spark(21, 400) },
  { id: "c22", mpn: "24LC256-I/SN", manufacturer: "Microchip", category: "Memory", description: "256kb I2C EEPROM", onHand: 5400, weeklyUsage: 380, leadTimeWeeks: 8, unitPrice: 0.42, supplierIds: ["s3", "s4", "s7"], stockHistory: spark(22, 5600) },
  { id: "c23", mpn: "IS25LP064A-JBLE", manufacturer: "ISSI", category: "Memory", description: "64Mb QSPI flash", onHand: 740, weeklyUsage: 180, leadTimeWeeks: 16, unitPrice: 0.95, supplierIds: ["s9"], stockHistory: spark(23, 1200) },

  // Power
  { id: "c24", mpn: "LM2596S-5.0/NOPB", manufacturer: "TI", category: "Power", description: "Buck reg 5V 3A", onHand: 2800, weeklyUsage: 220, leadTimeWeeks: 10, unitPrice: 1.8, supplierIds: ["s1", "s4"], stockHistory: spark(24, 3000) },
  { id: "c25", mpn: "AP2112K-3.3TRG1", manufacturer: "Diodes", category: "Power", description: "LDO 3.3V 600mA", onHand: 6800, weeklyUsage: 540, leadTimeWeeks: 6, unitPrice: 0.22, supplierIds: ["s10", "s4"], stockHistory: spark(25, 7000) },
  { id: "c26", mpn: "TPS62130RGTR", manufacturer: "TI", category: "Power", description: "Buck 3A 17V", onHand: 240, weeklyUsage: 140, leadTimeWeeks: 24, unitPrice: 2.6, supplierIds: ["s1"], stockHistory: spark(26, 700) },
  { id: "c27", mpn: "MCP73831T-2ACI/OT", manufacturer: "Microchip", category: "Power", description: "Li-ion charger 500mA", onHand: 3200, weeklyUsage: 280, leadTimeWeeks: 10, unitPrice: 0.48, supplierIds: ["s3", "s7"], stockHistory: spark(27, 3400) },
  { id: "c28", mpn: "BQ24074RGTR", manufacturer: "TI", category: "Power", description: "Power path Li-ion charger", onHand: 480, weeklyUsage: 180, leadTimeWeeks: 22, unitPrice: 2.2, supplierIds: ["s1", "s8"], stockHistory: spark(28, 900) },
  { id: "c29", mpn: "SI2302DDS-T1-GE3", manufacturer: "Vishay", category: "Power", description: "N-MOSFET 20V SOT-23", onHand: 14200, weeklyUsage: 980, leadTimeWeeks: 8, unitPrice: 0.09, supplierIds: ["s4", "s7"], stockHistory: spark(29, 14000) },
  { id: "c30", mpn: "SS14", manufacturer: "Onsemi", category: "Power", description: "Schottky 40V 1A", onHand: 18000, weeklyUsage: 1100, leadTimeWeeks: 6, unitPrice: 0.04, supplierIds: ["s10", "s4"], stockHistory: spark(30, 18500) },

  // Sensors
  { id: "c31", mpn: "BME280", manufacturer: "Bosch", category: "Sensor", description: "Temp/humidity/pressure", onHand: 980, weeklyUsage: 160, leadTimeWeeks: 14, unitPrice: 3.4, supplierIds: ["s5", "s11"], stockHistory: spark(31, 1400) },
  { id: "c32", mpn: "MPU-6050", manufacturer: "TDK", category: "Sensor", description: "6-axis IMU", onHand: 2200, weeklyUsage: 240, leadTimeWeeks: 10, unitPrice: 1.6, supplierIds: ["s10", "s4"], stockHistory: spark(32, 2400) },
  { id: "c33", mpn: "LIS3DH", manufacturer: "STMicro", category: "Sensor", description: "3-axis accelerometer", onHand: 140, weeklyUsage: 120, leadTimeWeeks: 22, unitPrice: 2.1, supplierIds: ["s1"], stockHistory: spark(33, 600) },
  { id: "c34", mpn: "VL53L1X", manufacturer: "STMicro", category: "Sensor", description: "ToF distance sensor", onHand: 380, weeklyUsage: 110, leadTimeWeeks: 18, unitPrice: 4.8, supplierIds: ["s7"], stockHistory: spark(34, 700) },
  { id: "c35", mpn: "SHT31-DIS-B", manufacturer: "Sensirion", category: "Sensor", description: "Humidity/temp sensor", onHand: 1100, weeklyUsage: 140, leadTimeWeeks: 12, unitPrice: 4.2, supplierIds: ["s5", "s7"], stockHistory: spark(35, 1300) },

  // More misc
  { id: "c36", mpn: "MAX17048G+T10", manufacturer: "Maxim", category: "Power", description: "Fuel gauge IC", onHand: 60, weeklyUsage: 80, leadTimeWeeks: 28, unitPrice: 3.6, supplierIds: ["s1"], stockHistory: spark(36, 320) },
  { id: "c37", mpn: "TXB0108PWR", manufacturer: "TI", category: "MCU", description: "8-bit level shifter", onHand: 3200, weeklyUsage: 260, leadTimeWeeks: 8, unitPrice: 1.1, supplierIds: ["s4", "s12"], stockHistory: spark(37, 3300) },
  { id: "c38", mpn: "FT232RL", manufacturer: "FTDI", category: "MCU", description: "USB-UART bridge", onHand: 740, weeklyUsage: 180, leadTimeWeeks: 14, unitPrice: 4.1, supplierIds: ["s5", "s7"], stockHistory: spark(38, 1100) },
  { id: "c39", mpn: "CP2102N-A02-GQFN28R", manufacturer: "Silicon Labs", category: "MCU", description: "USB-UART bridge", onHand: 240, weeklyUsage: 140, leadTimeWeeks: 22, unitPrice: 2.4, supplierIds: ["s8"], stockHistory: spark(39, 700) },
  { id: "c40", mpn: "PCA9685PW", manufacturer: "NXP", category: "MCU", description: "16-ch PWM driver", onHand: 1600, weeklyUsage: 130, leadTimeWeeks: 12, unitPrice: 1.9, supplierIds: ["s7", "s11"], stockHistory: spark(40, 1700) },
];

export function weeksOfSupply(c: Component): number {
  if (c.weeklyUsage === 0) return 99;
  return +(c.onHand / c.weeklyUsage).toFixed(1);
}

export function riskScore(c: Component): number {
  // 0-100, higher = more risk
  const wos = weeksOfSupply(c);
  const stockRisk = Math.max(0, Math.min(60, (12 - wos) * 6)); // <12wk = risky
  const leadRisk = Math.min(25, c.leadTimeWeeks * 0.9); // long lead time
  const sourceRisk = c.supplierIds.length === 1 ? 15 : c.supplierIds.length === 2 ? 6 : 0;
  return Math.min(100, Math.round(stockRisk + leadRisk + sourceRisk));
}

export function riskLevel(c: Component): RiskLevel {
  const s = riskScore(c);
  if (s >= 65) return "critical";
  if (s >= 40) return "watch";
  return "healthy";
}

export function riskReasons(c: Component): string[] {
  const reasons: string[] = [];
  const wos = weeksOfSupply(c);
  if (wos < 4) reasons.push(`Only ${wos}w of supply remaining`);
  else if (wos < 8) reasons.push(`Low buffer: ${wos}w of supply`);
  if (c.leadTimeWeeks >= 20) reasons.push(`Long lead time (${c.leadTimeWeeks}w)`);
  if (c.supplierIds.length === 1) reasons.push("Single-source dependency");
  const region = c.supplierIds.map((id) => suppliers.find((s) => s.id === id)?.region).filter(Boolean);
  if (region.length > 0 && region.every((r) => r === "Asia") && c.supplierIds.length <= 2) {
    reasons.push("Geographic concentration (Asia)");
  }
  return reasons;
}

export function suggestedAction(c: Component): string {
  const wos = weeksOfSupply(c);
  if (wos < 4) return `Place expedited order — coverage runs out in ~${Math.round(wos * 7)} days`;
  if (c.supplierIds.length === 1) return "Qualify a second source supplier";
  if (c.leadTimeWeeks >= 22) return "Pull-in PO and increase safety stock";
  return "Monitor weekly; reassess in 2 weeks";
}

export interface RiskAlert {
  id: string;
  componentId: string;
  reason: string;
  severity: RiskLevel;
  action: string;
  createdAt: string;
}

export function getAlerts(): RiskAlert[] {
  const alerts: RiskAlert[] = [];
  components.forEach((c) => {
    const lvl = riskLevel(c);
    if (lvl === "healthy") return;
    const reasons = riskReasons(c);
    alerts.push({
      id: `a-${c.id}`,
      componentId: c.id,
      reason: reasons[0] ?? "Risk detected",
      severity: lvl,
      action: suggestedAction(c),
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 7).toISOString(),
    });
  });
  return alerts.sort((a, b) => {
    const order = { critical: 0, watch: 1, healthy: 2 };
    return order[a.severity] - order[b.severity];
  });
}

export function getKpis() {
  const total = components.length;
  const atRisk = components.filter((c) => riskLevel(c) !== "healthy").length;
  const avgLead = +(
    components.reduce((s, c) => s + c.leadTimeWeeks, 0) / components.length
  ).toFixed(1);
  const openAlerts = getAlerts().length;
  return { total, atRisk, avgLead, openAlerts };
}

export function inventoryValueTrend(): { day: number; value: number }[] {
  const days = 30;
  const out: { day: number; value: number }[] = [];
  for (let i = 0; i < days; i++) {
    let v = 0;
    components.forEach((c) => {
      v += c.stockHistory[i] * c.unitPrice;
    });
    out.push({ day: i + 1, value: Math.round(v) });
  }
  return out;
}

export function topCritical(n = 5): Component[] {
  return [...components].sort((a, b) => riskScore(b) - riskScore(a)).slice(0, n);
}

export function getSupplier(id: string) {
  return suppliers.find((s) => s.id === id);
}

export function componentsBySupplier(supplierId: string) {
  return components.filter((c) => c.supplierIds.includes(supplierId));
}

export function getComponent(id: string) {
  return components.find((c) => c.id === id);
}
