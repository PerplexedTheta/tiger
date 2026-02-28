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

const Bus = class {
    constructor(config) {
        this.mode = config.mode;
        this.api = config.api;
        this.jQuery = config.jquery;

        if (this.mode == undefined)
            return this.throwError('no_mode', 'No mode was specified for this object.');
    };

    init = (() => {
        this.api.getLocations()
        .done(data => {
            this.locations = data.features;
            this.errors = data.errors;
        })
        .then(() => {
            this.location = this.locations.find(location => {
                return location.properties.atcoCode == this.api.atco_id;
            });

            this.setTitle(this.location.properties.commonName || '');
        });

        this.build()
        .then(() => {
            this.jQuery('div#loading')
            .remove();
        })
        .catch(error => {
            console.error(error);
        });

        return;
    });

    build = (async () => {
        return this.api.getServices()
        .done(data => {
            this.services = data.services;
            this.errors = data.errors;
        })
        .then(() => {
            this.resetDOM();

            if (this.errors)
                return this.throwError(this.errors[0].error, this.errors[0].message);

            if (this.services == undefined || this.services.length < 1)
                return this.throwError('no_data', 'There is currently no bus information available.');

            this.services.forEach((service, idx) => {
                if (this.mode == 'departs' && service.std == undefined)
                    return;

                if (this.mode == 'arrivees' && service.sta == undefined)
                    return;

                let uid = service.journey;
                let dom = this.loadDOM(uid);

                this.setOper(dom, 'PLYMCITYBUS');
                this.setStatus(dom, service.etd);
                this.setAddInfo(dom, service.etd);
                this.setTime(dom, service.std);
                this.setDest(dom, service.destination);
                this.setLine(dom, service.line);

                this.commitDOM(dom);
            });

            this.api.getUpdates()
            .done(data => {
                this.updates = data.updates;
                this.errors = data.errors;
            })
            .then(() => {
                if (this.errors)
                    return;

                if (this.updates == undefined || this.updates.length < 1)
                    return;

                this.updates.forEach((update, idx) => {
                    update.meta.affects.forEach((affect, idx) => {
                       affects.push(Number(affect));
                    });
                });
                affects = [...new Set(affects)];

                let specialNotice = 'There are issues affecting buses that pass this stop.';
                if (affects.length > 0)
                    specialNotice = specialNotice + ' Lines affected are: ' + affects.join(', ') + '.';
                specialNotice = specialNotice + ' For information, visit plymouthbus.co.uk/service-updates.';

                this.setSpecialNotice(this.jQuery('footer'), specialNotice);
            });
        })
        .fail(error => {
            console.error(error);

            if (error.responseJSON.errors) {
                let errors = error.responseJSON.errors;

                return this.throwError(errors[0].error, errors[0].message);
            }
        });
    });

    throwError = ((code, message) => {
        let dom = this.loadDOM('');

        this.setLine(dom, '', false);
        this.setCalls(dom, [{Name: message}]);

        this.commitDOM(dom);

        return {
            error: {
                code: code,
                message: message,
            },
        }
    });

    checkRefresh = (() => {
        const date = new Date;

        if (date.getSeconds() === 0)
            return true;
        return false;
    });

    loadDOM = (uid => {
        // initialise object
        let dom = this.jQuery('<div>');
        dom.addClass('row');
        dom.attr('data-uid', uid);
        dom.html('<div class=\"col opinfo\"><span class=\"oper\">&nbsp;<\/span><\/div><div class=\"col schedinfo\"><span class=\"status\">&nbsp;<\/span><span class=\"addinfo\">&nbsp;<\/span><\/div><div class=\"col boardinfo\"><span class=\"due alert\">&nbsp;<\/span><\/div><div class=\"col destinfo originfo\"><span class=\"dest orig\">&nbsp;<\/span><\/div><div class=\"col lineinfo\"><span class=\"line\">&nbsp;<\/span><\/div><div class=\"col callsinfo\"><ul class=\"calls\"><\/ul><\/div>');

        return dom;
    });

    commitDOM = (dom => {
        return this.jQuery('main')
        .append(dom);
    });

    resetDOM = (() => {
        return this.jQuery('main')
        .text('');
    });

    setAddInfo = ((dom, etd = '') => {
        let value = '\&nbsp\;';

        if (etd.real_time && etd.due != null) {
            value = etd.due;

            if (etd.real_time && etd.due != null && etd.due == 'Due') {
                value = 'Less that 1 min';

                dom.find('span.addinfo').first()
                .addClass('alert');
            }
        }

        return dom.find('span.addinfo').first()
        .html(value);
    });

    setCalls = ((dom, callingPoints = []) => {
        callingPoints.forEach(callingPoint => {
            dom.find('ul.calls').first()
            .append('<li>' + callingPoint.Name + '</li>');
        });

        return dom.find('ul.calls').first();
    });

    setDest = ((dom, dest) => {
        return dom.find('span.dest').first()
        .html(dest);
    });

    setOper = ((dom, oper = 'TFL') => {
        let tocMap = {
            'PLYMCITYBUS': 'CITYBUS',
        };
        oper = tocMap[oper] || oper;

        // special logo'd operators
        if (oper == 'CITYBUS') oper = '<img src=\"\/res\/vectors\/plymcitybus.svg\" style=\"width:2.25em\" alt=\"Plymouth CityBus\" \/>';

        return dom.find('span.oper').first()
        .html(oper);
    });

    setOrig = ((dom, orig) => {
        return dom.find('span.orig').first()
        .html(orig);
    });

    setLine = ((dom, line = '', lineChanged = false) => {
        if (lineChanged) dom.find('span.line').first()
        .addClass('alert');

        if (line == '') {
            dom.find('span.line').first()
            .remove();
            return undefined;
        }

        return dom.find('span.line').first()
        .html(line);
    });

    setSpecialNotice = ((dom, specialNotice) => {
        dom.addClass('alert');

        return dom.find('p').first()
        .html(specialNotice);
    });

    setStatus = ((dom, etd = '') => {
        let value;

        if (etd.real_time && etd.due == null) {
            value = 'En-route';
        } else if (etd.real_time && etd.due != null) {
            value = 'Due';

            if (etd.due == 'Due') {
                dom.find('span.status').first()
                .addClass('alert');
            }
        } else {
            value = 'Scheduled';

            dom.find('span.status').first()
            .addClass('danger');
        }

        return dom.find('span.status').first()
        .html(value);
    });

    setTime = ((dom, std = '') => {
        return dom.find('span.due').first()
        .html(std.due.replace(':', 'h'));
    });

    setTitle = ((stop = '') => {
        let title;

        if (this.mode == 'departs')
            title = 'Departures from ' + stop;
        else if (this.mode == 'arrivees')
            title = 'Arrivals at ' + stop;

        this.jQuery('title').text(title);

        return this.jQuery('header h1').first()
        .html(title);
    });
};

export default Bus;
