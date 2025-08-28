const Bus = class {
    constructor(config) {
        this.api = config.api;
        this.jQuery = config.jquery;
        this.stop = config.stop;
    };

    init = (() => {
        this.locations = this.fetchLocations();
        this.services = undefined;

        this.build()
        .then(() => {
            this.jQuery('#loading')
            .hide();
        });

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
                if (service.etd === '')
                    return;

                this.loadDOM(idx);
                this.setDest(idx, service.dest);
                this.setBusCo(idx, 'Plymouth CityBus');
                this.setLine(idx, service.line);
                this.setExp(idx, service.etd);
                this.setRTPI(idx, service.rtpi);
            });

            this.checkHomework();
        })
        .fail(error => {
            console.error(error);

            window.location.href = '/' + error.status;
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
        .append('<div class=\"main-row-header\"><div class=\"main-col-time\"><\/div><div class=\"main-col-dest\">destination<\/div><div class=\"main-col-line\">line<\/div><div class=\"main-col-issue\"><\/div><div class=\"main-col-exp\">expected<\/div><div class=\"main-col-rtpi\">tracking<\/div><\/div>');
    });

    loadDOM = (idx => {
        return this.jQuery('main')
        .append('<div class=\"main-row\" data-idx=\"' + idx + '\"><div class=\"main-col-time\"><\/div><div class=\"main-col-dest\">destination<\/div><div class=\"main-col-line\">line<\/div><div class=\"main-col-issue\"><\/div><div class=\"main-col-exp\">expected<\/div><div class=\"main-col-rtpi\">tracking<\/div><\/div>');
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

        return this.jQuery('div[data-idx="' + idx + '"]').find('div.main-col-dest').first()
            .append('<span class=\"busco\">' + article + ' ' + busco + ' service<\/span>');
    });

    setDest = ((idx, destination) => {
        return this.jQuery('div[data-idx="' + idx + '"]').find('div.main-col-dest').first()
        .text(destination);
    });

    setExp = ((idx, due) => {
        if (due === 'Due')
            due = '<span class=\"due\">Due<\/span>';
    
        return this.jQuery('div[data-idx="' + idx + '"]').find('div.main-col-exp').first()
        .html(due);
    });

    setIncident = (incident => {
        this.jQuery('#incident').parent('div').first()
        .css('visibility', 'visible');

        return this.jQuery('#incident').first()
        .text(incident);
    });

    setLine = ((idx, line) => {
        return this.jQuery('div[data-idx="' + idx + '"]').find('div.main-col-line').first()
        .text(line);
    });

    setRTPI = ((idx, rtpi = false) => {
        let rtpiHtml = 'Scheduled';
        if (rtpi)
            rtpiHtml = '<span class=\"rtpi\">Real-time</span>';

        return this.jQuery('div[data-idx="' + idx + '"]').find('div.main-col-rtpi').first()
        .html(rtpiHtml);
    });

    setTitle = ((station = '') => {
        let titleText = '';
        let headlineText = '';

        if (station === '') {
            window.location.href = '/404';
        } else {
            headlineText = 'Departures from ' + station;
        }

        this.jQuery('title')
        .text(station + ' Bus Times');

        return this.jQuery('h1#headline')
        .text(headlineText);
    });
};

export default Bus;
