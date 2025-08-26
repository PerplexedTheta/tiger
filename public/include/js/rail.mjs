const Rail = class {
    constructor(config) {
        this.api = config.api;
        this.jQuery = config.jquery;
        this.tiploc = config.tiploc;
    };

    init = (() => {
        this.locations = this.fetchLocations();
        this.services = undefined;

        this.build();

        return;
    });

    build = (async () => {
        return this.api.getServices()
        .done(data => {
            this.services = data.services;
            this.resetDOM();
            this.loadHeader();
            this.setTitle( data.Name );

            this.services.forEach(service => {
                if (service.STD === '')
                    return;

                let uid = service.UID;

                this.loadDOM(uid);
                this.setTime(uid, service.STD);
                this.setDest(uid, service.Destinations.Front.Name);
                this.setToc(uid, service.ATOCDesc);
                this.setVia(uid, service.Destinations.Front.Via)
                this.setTyrell(uid, service.Comments);
                this.setPlat(uid, service.Platform, service.PlatformChanged);
                this.setExp(uid, this.STD, service.ETD, service.Delay);
                this.setFormed(uid, service.Destinations.Front.Coaches);
            });
        })
        .fail(error => {
            console.error(error);
        });
    });

    fetchLocations = (async () => {
        return this.api.getLocations()
        .done(data => {
            this.locations = data || undefined;
        })
        .fail(error => {
            console.error(error);
        });
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

    loadHeader = (() => {
        return this.jQuery('main')
        .append('<div class=\"main-row-header\"><div class=\"main-col-time\">time<\/div><div class=\"main-col-dest\">destination<\/div><div class=\"main-col-plat\">plat.<\/div><div class=\"main-col-issue\"><\/div><div class=\"main-col-exp\">expected<\/div><div class=\"main-col-formed\">formed<\/div><\/div>');
    });

    loadDOM = (uid => {
        return this.jQuery('main')
        .append('<div class=\"main-row\" data-uid=\"' + uid + '\"><div class=\"main-col-time\"><\/div><div class=\"main-col-dest\"><span class=\"via\"><\/span><\/div><div class=\"main-col-plat\"><span class=\"amended\"><\/span><\/div><div class=\"main-col-issue\"><\/div><div class=\"main-col-exp\"><span class=\"cancelled\"><\/span><\/div><div class=\"main-col-formed\"><\/div><\/div>');
    });

    resetDOM = (() => {
        return this.jQuery('main')
        .text('');
    });

    setDest = ((uid, destination) => {
        return this.jQuery('div[data-uid="' + uid + '"]').find('div.main-col-dest').first()
        .text(destination);
    });

    setExp = ((uid, STD = '', ETD = '', delay = '') => {
        let value = (STD === ETD) ? 'On time' : ETD;

        if (delay === 'CAN')
            value = '<span class=\"cancelled\">' + value + '<\/span>';

        return this.jQuery('div[data-uid="' + uid + '"]').find('div.main-col-exp').first()
        .html(value);
    });

    setFormed = ((uid, formed = undefined) => {
        let pluralisation = (formed > 1) ? 'coaches' : 'coach';

        if (formed === undefined)
            return;

        return this.jQuery('div[data-uid="' + uid + '"]').find('div.main-col-formed').first()
        .text(formed + ' ' + pluralisation);
    });

    setPlat = ((uid, platform = '', platformChanged = false) => {
        let platformHtml = platform;

        if (platformChanged)
            platformHtml = '<span class=\"amendment\">' + platform + '<\/span>';

        return this.jQuery('div[data-uid="' + uid + '"]').find('div.main-col-plat').first()
        .html(platformHtml);
    });

    setTime = ((uid, time = '') => {
        return this.jQuery('div[data-uid="' + uid + '"]').find('div.main-col-time').first()
        .text(time);
    });

    setTitle = ((station = '') => {
        let headlineText = '';

        if (station === '') {
            headlineText = '404 \u2013 Not Found';
            this.jQuery('main')
            .html('<p class=\"errors\">The TIPLOC ID entered is not valid.<\/p>');
        } else {
            headlineText = 'Departures from ' + station;
        }

        return this.jQuery('h1#headline')
        .text(headlineText);
    });

    setToc = ((uid, toc = 'GWR') => {
        let article = 'A';
        let an_tocs = ['SWR', 'Elizabeth line'];

        if (an_tocs.includes(toc))
            article = 'An';

        return this.jQuery('div[data-uid="' + uid + '"]').find('div.main-col-dest').first()
            .append('<span class=\"toc\">' + article + ' ' + toc + ' service<\/span>');
    });

    setTyrell = ((uid, comments = undefined) => {
        if (comments === undefined)
            return;

        let tyrell = '';

        if (comments.DepartureLine1 !== undefined)
            tyrell = tyrell + comments.DepartureLine1 + ' ';
        if (comments.DepartureLine2 !== undefined)
            tyrell = tyrell + comments.DepartureLine2 + ' ';
        if (comments.DepartureLine3 !== undefined)
            tyrell = tyrell + comments.DepartureLine3 + ' ';

        return this.jQuery('div[data-uid="' + uid + '"]').find('div.main-col-dest').first()
        .append('<span class=\"tyrell\">' + tyrell + '<\/span>');
    });

    setVia = ((uid, via = undefined) => {
        if (via === undefined)
            return;
    
        return this.jQuery('div[data-uid="' + uid + '"]').find('div.main-col-dest .toc').first()
        .append(' <span class=\"via\">via ' + via + '<\/span>');
    });
};

export default Rail;
