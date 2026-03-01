//  This file is part of tiger
//
//  Copyright 2025 PerplexedTheta
//
//  Licensed under the Apache License, Version 2.0 (the "License");
//  you may not use this file except in compliance with the License.
//  You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
//  Unless required by applicable law or agreed to in writing, software
//  distributed under the License is distributed on an "AS IS" BASIS,
//  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  See the License for the specific language governing permissions and
//  limitations under the License.

const API = class {
    constructor(config) {
        this.jQuery = config.jquery;
        this.locations = undefined;

        this.location = config.location
            ? config.location
            : "51.4515621,-2.6050402";
    }

    init = () => {
        return;
    };

    getLocations = () => {
        return this.jQuery.get(
            "/api/v1/bus/uk/woe/locations?location=" + this.location,
        );
    };

    getRoute = (route_id) => {
        return this.jQuery.get("/api/v1/bus/uk/woe/routes/" + route_id);
    };

    getServices = (stop_id) => {
        return this.jQuery.get("/api/v1/bus/uk/woe/services/" + stop_id);
    };

    getStop = () => {
        return this.stop_id;
    };

    getRoute = () => {
        return this.route_id;
    };
};

export default API;
