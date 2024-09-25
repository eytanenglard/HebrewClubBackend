/**
 * Generates a unique ID combining timestamp and random characters.
 * @returns {string} A unique ID string
 */
export declare function generateUniqueId(): string;
/**
 * Generates a unique course ID with a 'C' prefix.
 * @returns {string} A unique course ID string
 */
export declare function generateUniqueCourseId(): string;
/**
 * Checks if a given ID is valid according to our generation pattern.
 * @param {string} id - The ID to validate
 * @returns {boolean} True if the ID is valid, false otherwise
 */
export declare function isValidUniqueId(id: string): boolean;
/**
 * Checks if a given course ID is valid according to our generation pattern.
 * @param {string} id - The course ID to validate
 * @returns {boolean} True if the course ID is valid, false otherwise
 */
export declare function isValidUniqueCourseId(id: string): boolean;
