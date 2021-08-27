/**
 * @property {Map<String; Object>} memory Internal memory
 * @function getItem Returns Cached item
 * @function addItem Adds item to cache
 */
class Store {

    /**
     * Returns cached Organization 
     * @param {String} _name Name of the Organization
     * @returns {(object|null)} Organization object || null
     */
    static getItem(_name) {
        return this.memory.has(_name) ? this.memory.get(_name) : null;
    }

    /**
     * Check if item is in store
     * @param {String} _name Name of the Organization
     * @returns {boolean}
     */
    static hasItem(_name) {
        return this.memory.has(_name);
    }

    /**
     * Adds an item to cache
     * @param {String} _name Name of the Organization
     * @param {object} _obj Organization object
     * @returns {boolean}
     */
    static addItem(_name, _obj) {
        if (typeof _obj != "object") return false;
        return this.memory.has(_name) ? false : !!this.memory.set(_name, _obj);
    }

    static memory = new Map();
}



export default Store;