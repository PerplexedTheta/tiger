const API = class {
    constructor(config) {
        this.jQuery = config.jquery;
        this.locations = undefined;
        this.stop_id = config.stop_id;
    };

    init = (() => {
        return;
    });

    getLocations = (() => {
        return this.jQuery.get('/api/v1/bus/CityBus/locations');
    });

    getServices = (() => {
        return this.jQuery.get('/api/v1/bus/CityBus/services/' + this.stop_id);
    });

    getStop = (() => {
        return this.stop_id;
    });
};

export default API;
