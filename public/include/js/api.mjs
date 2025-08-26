const API = class {
    constructor(config) {
        this.jQuery = config.jquery;
        this.locations = undefined;
        this.tiploc_id = config.tiploc_id;
    };

    init = (() => {
        return;
    });

    getLocations = (() => {
        return this.jQuery.get('/api/v1/rail/locations');
    });

    getServices = (() => {
        return this.jQuery.get('/api/v1/rail/services/' + this.tiploc_id);
    });

    getTiploc = (() => {
        return this.tiploc_id;
    });
};

export default API;
