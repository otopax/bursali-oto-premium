/**
 * Enterprise VIN (Vehicle Identification Number) Decoder
 * Parses the 17-character VIN to extract WMI, VDS, and Year.
 * Future: Hook into NHTSA API for exact trim decoding.
 */

class VINDecoder {
  
  /**
   * Validates if the string is a structurally correct 17-character VIN
   */
  static isValidVIN(vin) {
    const regex = /^[A-HJ-NPR-Z0-9]{17}$/i;
    return regex.test(vin);
  }

  /**
   * Basic structural decoding of the VIN
   * @param {string} vin 
   */
  static decodeBasic(vin) {
    if (!this.isValidVIN(vin)) {
      throw new Error("Invalid VIN Format. Must be 17 characters (excluding I, O, Q).");
    }

    const wmi = vin.substring(0, 3).toUpperCase();
    const vds = vin.substring(3, 9).toUpperCase();
    const vis = vin.substring(9, 17).toUpperCase();
    
    const yearChar = vin.charAt(9).toUpperCase();
    const year = this.getYearFromChar(yearChar);

    return {
      wmi,           // World Manufacturer Identifier
      vds,           // Vehicle Descriptor Section
      vis,           // Vehicle Identifier Section
      modelYear: year,
      region: this.getRegionFromWMI(wmi),
      manufacturer: this.getManufacturerFromWMI(wmi)
    };
  }

  static getYearFromChar(char) {
    const yearMap = {
      'A': 2010, 'B': 2011, 'C': 2012, 'D': 2013, 'E': 2014,
      'F': 2015, 'G': 2016, 'H': 2017, 'J': 2018, 'K': 2019,
      'L': 2020, 'M': 2021, 'N': 2022, 'P': 2023, 'R': 2024,
      'S': 2025, 'T': 2026
    };
    return yearMap[char] || "Unknown";
  }

  static getRegionFromWMI(wmi) {
    const firstChar = wmi.charAt(0);
    if (/[A-H]/.test(firstChar)) return "Africa";
    if (/[J-R]/.test(firstChar)) return "Asia";
    if (/[S-Z]/.test(firstChar)) return "Europe";
    if (/[1-5]/.test(firstChar)) return "North America";
    if (/[6-7]/.test(firstChar)) return "Oceania";
    if (/[8-9]/.test(firstChar)) return "South America";
    return "Unknown Region";
  }

  static getManufacturerFromWMI(wmi) {
    const prefix = wmi.substring(0, 2);
    const map = {
      '1H': 'Honda USA',
      'JHM': 'Honda Japan',
      'WA': 'Audi',
      'WB': 'BMW',
      'WBA': 'BMW',
      'WV': 'Volkswagen',
      'WP': 'Porsche',
      'JM': 'Mazda',
      'JT': 'Toyota'
    };
    return map[wmi] || map[prefix] || "Unknown Manufacturer";
  }
}

module.exports = { VINDecoder };
