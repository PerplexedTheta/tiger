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

const Locations = class {
    constructor(config) {
        this.api = config.api;
        this.jQuery = config.jquery;
    }

    init = async () => {
        let lat = jQuery('input[name="search-lat-input"]').val();
        let long = jQuery('input[name="search-long-input"]').val();

        if (lat && long) this.api.location = "" + lat + "," + long;

        return this.build().then(() => {
            this.handleSearchArea();
            this.handleFilter();
        });
    };

    build = async () => {
        return this.api
            .getLocations()
            .done((data) => {
                this.locations = data.elements;
            })
            .then(() => {
                this.resetDOM();

                this.locations.forEach((location, idx) => {
                    let id = location.id;
                    let name = location.name;
                    let bearing = location.bearing;
                    let dom = this.loadDOM(id, name);

                    this.setStop(dom, name, bearing);
                    this.setDeparts(dom, id);

                    this.commitDOM(dom);
                });
            })
            .fail((error) => {
                if (error.responseJSON.errors) {
                    let errors = error.responseJSON.errors;

                    return this.throwError(errors[0].error, errors[0].message);
                }
            });
    };

    throwError = (code, message) => {
        let dom = this.loadDOM("");

        this.setLine(dom, "", false);
        this.setCalls(dom, [{ Name: message }]);

        this.commitDOM(dom);

        return {
            error: {
                code: code,
                message: message,
            },
        };
    };

    loadDOM = (id, name = "") => {
        // initialise object
        let dom = this.jQuery("<li>");
        dom.addClass("list-group-item");
        dom.attr("data-id", id);
        dom.attr("data-name", name.toUpperCase());

        dom.html(
            '<strong>#STATION<\/strong> | <a href=\"#DEPARTS\">Departures<\/a>',
        );

        return dom;
    };

    commitDOM = (dom) => {
        return this.jQuery("ul.list-group").first().append(dom);
    };

    resetDOM = () => {
        return this.jQuery("ul.list-group").text("");
    };

    handleSearchArea = () => {
        this.jQuery('input[name="search-lat-input"]')
            .first()
            .removeAttr("disabled");
        this.jQuery('input[name="search-long-input"]')
            .first()
            .removeAttr("disabled");

        let lat = "" + jQuery('input[name="search-lat-input"]').first().val();
        let long = "" + jQuery('input[name="search-long-input"]').first().val();
        let location = lat + "," + long;
        this.commitHistory(
            { page_id: "Tiger::Controller::Bus::UK::WoE::Mainpage#mainpage" },
            window.location.pathname + "?location=" + location,
        );

        this.jQuery('input[name="search-lat-input"]')
            .first()
            .on("change keyup paste", () => {
                lat =
                    "" + jQuery('input[name="search-lat-input"]').first().val();
                long =
                    "" +
                    jQuery('input[name="search-long-input"]').first().val();
                location = lat + "," + long;
                this.commitHistory(
                    {
                        page_id:
                            "Tiger::Controller::Bus::UK::WoE::Mainpage#mainpage",
                    },
                    window.location.pathname + "?location=" + location,
                );

                this.api.location = location;
                this.build();
            });

        this.jQuery('input[name="search-long-input"]')
            .first()
            .on("change keyup paste", () => {
                lat =
                    "" + jQuery('input[name="search-lat-input"]').first().val();
                long =
                    "" +
                    jQuery('input[name="search-long-input"]').first().val();
                location = lat + "," + long;
                this.commitHistory(
                    {
                        page_id:
                            "Tiger::Controller::Bus::UK::WoE::Mainpage#mainpage",
                    },
                    window.location.pathname + "?location=" + location,
                );

                this.api.location = location;
                this.build();
                this.setURLParams(this.api.location);
            });

        return;
    };

    handleFilter = () => {
        this.jQuery('input[name="filter-input"]')
            .first()
            .removeAttr("disabled");

        this.jQuery('input[name="filter-input"]')
            .first()
            .on("change keyup paste", () => {
                const value = this.jQuery('input[name="filter-input"]')
                    .first()
                    .val()
                    .toUpperCase();

                this.jQuery("li.list-group-item").each((idx, element) => {
                    if (value == "") {
                        this.jQuery(element).show();
                    } else if (
                        this.jQuery(element).is("[data-name*='" + value + "']")
                    ) {
                        this.jQuery(element).show();
                    } else {
                        this.jQuery(element).hide();
                    }
                });
            });

        return;
    };

    commitHistory = (state, url) => {
        return history.pushState(state, undefined, url);
    };

    setDeparts = (dom, id) => {
        return dom
            .find('a[href="#DEPARTS"]')
            .first()
            .attr("href", "/bus/uk/woe/" + id + "/departs");
    };

    setStop = (dom, name = "", bearing = "") => {
        return dom
            .find("strong")
            .first()
            .text(name + " (" + bearing + ")");
    };
};

export default Locations;
