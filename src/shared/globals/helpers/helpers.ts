export class Helpers {
  /**
   *
   * @param str
   *
   * Static methods can be called without instatiating the class
   */
  static firstLetterUppercase(str: string) {
    const valueString = str.toLowerCase();

    return valueString
      .split(' ')
      .map(
        (value: string) => `${value.charAt(0).toLowerCase()}${value.slice(1).toLowerCase()}`
      )
      .join(' ');
  }

  static lowerCase(str: string) {
    return str.toLowerCase();
  }

  static generateRandomIntegers(integerLength: number): number {
    const chars = '0123456789';
    let result = '';
    for(let i = 0; i < integerLength; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return parseInt(result, 10);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parseJson(prop: string): any {
    try {
      return JSON.parse(prop);
    } catch (error) {
      return prop;
    }
  }
}
