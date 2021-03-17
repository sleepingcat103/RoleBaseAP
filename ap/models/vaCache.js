const NodeCache = require("node-cache");

const configCache = new NodeCache();
const ansPackCache = new NodeCache();
const routerCache = new NodeCache();
const hasChainCache = new NodeCache();
const skillChain = new NodeCache();

class vaCache {
    constructor() {
    }

    setNewSkillSession() {
        let newSkillSession = {
            "Domain_Skill_ID": "",
            "Current_Skill_ID": "",
            "Current_Session_ID": "",
            "Chain": []
        }
        return newSkillSession;
    }

    setRouterID(key, value) {
        routerCache.set(key, value, 1000);
    }

    getRouterID(key) {
        return routerCache.get(key);
    }

    setConfig(key, value) {
        configCache.set(key, value, 1000);
    }

    getConfig(key) {
        return configCache.get(key);
    }

    setAnsPack(key, value) {
        ansPackCache.set(key, value, 1000);
    }

    getAnsPack(key) {
        return ansPackCache.get(key);
    }

    setHasChain(key, value) {
        hasChainCache.set(key, value, 1000);
    }

    getHasChain(key) {
        return hasChainCache.get(key);
    }

    setSkillChain(key, value) {
        skillChain.set(key, value, 1000);
    }

    getSkillChain(key) {
        return skillChain.get(key);
    }
}

module.exports = new vaCache();