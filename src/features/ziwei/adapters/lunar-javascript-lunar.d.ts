// TYPE-ONLY augmentation of the `lunar-javascript` module with the `Lunar` export used by the Ziwei
// birth mapper (lunar → solar conversion). The frozen 사주 engine's own declaration
// (src/features/interpretation/solarTerm/lunar-javascript.d.ts) only declares `Solar`; ambient module
// declarations MERGE across files, so this ADDS `Lunar` without editing the frozen file. No runtime
// code — the export exists at runtime (verified) and this only describes the small surface we use.
declare module 'lunar-javascript' {
  interface LunarJsSolarDate {
    getYear(): number;
    getMonth(): number;
    getDay(): number;
  }
  interface LunarJsLunarDate {
    getSolar(): LunarJsSolarDate;
  }
  export const Lunar: {
    /** month is 1–12; a LEAP month is passed as a NEGATIVE number (lunar-javascript convention). */
    fromYmd(year: number, month: number, day: number): LunarJsLunarDate;
  };
}
