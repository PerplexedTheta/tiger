const Bus = class {
    constructor(config) {
        this.api = config.api;
        this.jQuery = config.jquery;
        this.stop = config.stop;
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

            if (data.services === undefined) {
                this.setTitle( '' );
                return;
            }
            this.setTitle( data.name );

            this.loadHeader();

            this.services.forEach((service, idx) => {
                console.log(service);
                if (service.etd === '')
                    return;

                this.loadDOM(idx);
                this.setLastStop(idx, service.dest);
                this.setBusCo(idx, 'Plymouth CityBus');
                this.setLine(idx, service.line);
                this.setDue(idx, service.etd);
                this.setRTPI(idx, service.rtpi);
            });

            this.checkHomework();
        })
        .fail(error => {
            console.error(error);
        });
    });

    checkHomework = (() => {
        if (this.jQuery('div[data-idx]').length === 0) {
            return this.jQuery('main')
            .html('<p class="silent">No services currently operating<\/p>');
        }

        return;
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

    checkRefresh = (() => {
        const date = new Date;

        if (date.getSeconds() === 0)
            return true;
        return false;
    });

    loadHeader = (() => {
        return this.jQuery('main')
        .append('<div class=\"main-row-header\"><div class=\"main-col-laststop\">destination<\/div><div class=\"main-col-line\">line<\/div><div class=\"main-col-issue\"><\/div><div class=\"main-col-due\">expected<\/div><div class=\"main-col-rtpi\">tracking<\/div><\/div>');
    });

    loadDOM = (idx => {
        return this.jQuery('main')
        .append('<div class=\"main-row\" data-idx=\"' + idx + '\"><div class=\"main-col-laststop\">destination<\/div><div class=\"main-col-line\">line<\/div><div class=\"main-col-issue\"><\/div><div class=\"main-col-due\">expected<\/div><div class=\"main-col-rtpi\">tracking<\/div><\/div>');
    });

    resetDOM = (() => {
        return this.jQuery('main')
        .text('');
    });

    setBusCo = ((idx, busco = 'Plymouth CityBus') => {
        let article_map = {
            '*': 'A',
        };
        let article = article_map[busco] || article_map['*'];

        return this.jQuery('div[data-idx="' + idx + '"]').find('div.main-col-laststop').first()
            .append('<span class=\"busco\">' + article + ' ' + busco + ' service<\/span>');
    });

    setDue = ((idx, due) => {
        return this.jQuery('div[data-idx="' + idx + '"]').find('div.main-col-due').first()
        .text(due);
    });

    setLastStop = ((idx, destination) => {
        return this.jQuery('div[data-idx="' + idx + '"]').find('div.main-col-laststop').first()
        .text(destination);
    });

    setLine = ((idx, line) => {
        return this.jQuery('div[data-idx="' + idx + '"]').find('div.main-col-line').first()
        .text(line);
    });

    setRTPI = ((idx, rtpi = false) => {
        let rtpiHtml = 'Schedule only';
        if (rtpi)
            rtpiHtml = '<span class=\"rtpi\">Real-time</span>';

        return this.jQuery('div[data-idx="' + idx + '"]').find('div.main-col-rtpi').first()
        .html(rtpiHtml);
    });

    setTitle = ((station = '') => {
        let headlineText = '';

        if (station === '') {
            headlineText = '404 \u2013 Not Found';
            this.jQuery('main')
            .html('<p class=\"errors\">The stop ID entered is not valid.<\/p>');
        } else {
            headlineText = 'Departures from ' + station;
        }

        return this.jQuery('h1#headline')
        .text(headlineText);
    });
};

export default Bus;
