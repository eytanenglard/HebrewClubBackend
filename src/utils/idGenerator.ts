// File: src/utils/idGenerator.ts

/**
 * Generates a unique ID combining timestamp and random characters.
 * @returns {string} A unique ID string
 */
export function generateUniqueId(): string {
    const timestamp = Date.now().toString(36); // Convert current timestamp to base 36
    const randomPart = Math.random().toString(36).substr(2, 5); // Generate 5 random characters
    return `${timestamp}-${randomPart}`;
  }
  
  /**
   * Generates a unique course ID with a 'C' prefix.
   * @returns {string} A unique course ID string
   */
  export function generateUniqueCourseId(): string {
    return `C-${generateUniqueId()}`;
  }
  
  /**
   * Checks if a given ID is valid according to our generation pattern.
   * @param {string} id - The ID to validate
   * @returns {boolean} True if the ID is valid, false otherwise
   */
  export function isValidUniqueId(id: string): boolean {
    const pattern = /^[a-z0-9]{8,}-[a-z0-9]{5}$/;
    return pattern.test(id);
  }
  
  /**
   * Checks if a given course ID is valid according to our generation pattern.
   * @param {string} id - The course ID to validate
   * @returns {boolean} True if the course ID is valid, false otherwise
   */
  export function isValidUniqueCourseId(id: string): boolean {
    const pattern = /^C-[a-z0-9]{8,}-[a-z0-9]{5}$/;
    return pattern.test(id);
  }