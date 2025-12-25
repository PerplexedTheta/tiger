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

const UKRail = class {
    constructor(config) {
        this.mode = config.mode;
        this.api = config.api;
        this.jQuery = config.jquery;

        if (this.mode == undefined)
            return this.throwError('no_mode', 'No mode was specified for this object.');
    };

    init = (() => {
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
            this.setTitle(data.Name || data.TIPLOC || '');

            this.services = data.services;
            this.resetDOM();

            if (data.detail) {
                if (data.detail.includes('Location with TIPLOC') && data.detail.includes('not found')) {
                    return this.throwError('no_tiploc', data.detail);
                }
            }

            if (data.services == undefined || data.services.length < 1)
                return this.throwError('no_data', 'There is currently no train information available.');

            if (data.specialNotice != '') this.setSpecialNotice(this.jQuery('footer'), data.specialNotice);
            if (data.incidentSummary != '') this.setIncidentSummary(this.jQuery('footer'), data.incidentSummary);

            this.services.forEach((service, idx) => {
                if (this.mode == 'departs' && service.STD == '')
                    return;

                if (this.mode == 'arrivees' && service.STA == '')
                    return;

                let uid = service.UID;
                let dom = this.loadDOM(uid);

                this.setOper(dom, service.ATOCCode);
                this.setHeadCode(dom, service.Headcode);
                this.setStatus(dom, service.STD, service.ETD, service.Delay);
                this.setAddInfo(dom, service.STD, service.ETD, service.Delay);
                this.setPlatform(dom, service.Platform, service.PlatformChanged);

                if (this.mode == 'departs') {
                    this.setTime(dom, service.STD);
                    this.setDest(dom, service.Destinations.Front.Name);

                    if (idx < 2 && service.CallingPoints)
                        this.setCalls(dom, service.CallingPoints.Front, true);
                }

                if (this.mode == 'arrivees') {
                    this.setTime(dom, service.STA);
                    this.setOrig(dom, service.Origins.Front.Name);
                }

                this.commitDOM(dom);
            });
        })
        .fail(error => {
            console.error(error);
        });
    });

    throwError = ((code, message) => {
        let dom = this.loadDOM('');

        this.setPlatform(dom, '', false);
        this.setCalls(dom, [{Name: message}], false);

        this.commitDOM(dom);

        return {
            error: {
                code: code,
                message: message,
            },
        }
    });

    fetchServices = (async () => {
        return this.api.getServices()
        .done(data => {
            this.services = data.services || undefined;
        })
        .fail(error => {
            console.error(error);
        });
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
        dom.html('<div class=\"col opinfo\"><span class=\"oper\">&nbsp;<\/span><span class=\"headcode\">&nbsp;<\/span><\/div><div class=\"col schedinfo\"><span class=\"status\">&nbsp;<\/span><span class=\"addinfo\">&nbsp;<\/span><\/div><div class=\"col boardinfo\"><span class=\"due alert\">&nbsp;<\/span><\/div><div class=\"col destinfo originfo\"><span class=\"dest orig\">&nbsp;<\/span><\/div><div class=\"col platinfo\"><span class=\"platform\">&nbsp;<\/span><\/div><div class=\"col callsinfo\"><ul class=\"calls\"><\/ul><\/div>');

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

    setAddInfo = ((dom, STD = '', ETD = '', delay = '') => {
        let value = 'Delayed';
        delay = Number(delay.replace('+', ''));

        if (STD == ETD || ETD == 'On time') value = 'On time';
        if (delay === 'CAN') value = 'Cancelled';

        if (value == 'On time') return;
        if (isNaN(delay)) return;

        return dom.find('span.addinfo').first()
        .addClass('alert')
        .html(delay + ' minutes');
    });

    setCalls = ((dom, callingPoints = [], animated = false) => {
        callingPoints.forEach(callingPoint => {
            dom.find('ul.calls').first()
            .append('<li>' + callingPoint.Name + '</li>');
        });

        if (animated) dom.find('ul.calls').first()
        .addClass('animated');

        return dom.find('ul.calls').first();
    });

    setDest = ((dom, dest) => {
        return dom.find('span.dest').first()
        .html(dest);
    });

    setHeadCode = ((dom, headcode = '') => {
        return dom.find('span.headcode').first()
        .html(headcode);
    });

    setIncidentSummary = ((dom, incidentSummary) => {
        dom.addClass('danger');

        return dom.find('p').first()
        .html(incidentSummary);
    });

    setOper = ((dom, oper = 'GB') => {
        let tocMap = {
            'EM': 'EMR',
            'GB': 'GBR',
            'GC': 'GC',
            'GN': 'GN',
            'GR': 'LNER',
            'GW': 'GWR',
            'GX': 'GWX',
            'HT': 'HT',
            'HX': 'HRX',
            'LD': 'Lumo',
            'LE': 'GA',
            'LM': 'LNW',
            'LO': 'TfL',
            'NI': 'TLNI',
            'NT': 'NT',
            'SN': 'SN',
            'SE': 'SE',
            'SR': 'SR',
            'SW': 'SWR',
            'TL': 'TL',
            'TP': 'TPE',
            'VT': 'AWC',
            'XC': 'XC',
            'XR': 'TfL',
        };
        oper = tocMap[oper] || oper;

        // special logo'd operators
        if (oper == 'GWR') oper = '<img src=\"\/res\/vectors\/gwr.svg\" style=\"width:2.25em\" alt=\"GWR\" \/>';
        if (oper == 'SR') oper = '<img src=\"\/res\/vectors\/scot.svg\" style=\"width:2.25em\" alt=\"ScotRail\" \/>';

        return dom.find('span.oper').first()
        .html(oper);
    });

    setOrig = ((dom, orig) => {
        return dom.find('span.orig').first()
        .html(orig);
    });

    setPlatform = ((dom, platform = '', platformChanged = false) => {
        if (platformChanged) dom.find('span.platform').first()
        .addClass('alert');

        if (platform == '') {
            dom.find('span.platform').first()
            .remove();
            return undefined;
        }

        return dom.find('span.platform').first()
        .html(platform);
    });

    setSpecialNotice = ((dom, specialNotice) => {
        dom.addClass('alert');

        return dom.find('p').first()
        .html(specialNotice);
    });

    setStatus = ((dom, STD = '', ETD = '', delay = '') => {
        let value = 'Delayed';

        if (STD == ETD || ETD == 'On time') value = 'On time';
        if (delay === 'CAN') value = 'Cancelled';

        if (value == 'Delayed') dom.find('span.status').first().addClass('alert');
        else if (value == 'Cancelled') dom.find('span.status').first().addClass('danger');

        return dom.find('span.status').first()
        .html(value);
    });

    setTime = ((dom, time = '') => {
        return dom.find('span.due').first()
        .html(time.replace(':', 'h'));
    });

    setTitle = ((station = '') => {
        let title;

        if (this.mode == 'departs')
            title = 'Departures from ' + station;
        else if (this.mode == 'arrivees')
            title = 'Arrivals at ' + station;

        this.jQuery('title').text(title);

        return this.jQuery('header h1').first()
        .html(title);
    });
};

export default UKRail;
