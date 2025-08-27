const Clock = class {
    constructor(config) {
        this.date = undefined;
        this.jQuery = config.jquery;
        this.hideSecs = config.hideSecs;
    };

    init = (() => {
        return setInterval(
            (() => {
                return this.update();
            }),
            83
        );
    });

    update = (async () => {
        this.date = new Date;

        let HH = this.format(this.date.getHours());
        let MM = this.format(this.date.getMinutes());
        let SS = this.format(this.date.getSeconds());

        let time = HH + ':' + MM;
        if (this.hideSecs !== '1')
            time = time + ':' + SS;

        return this.jQuery('span#clock').first()
        .text(time);
    });

    format = (input => {
        if (input < 10) input = "0" + input;

        return input;
    });
};

export default Clock;
