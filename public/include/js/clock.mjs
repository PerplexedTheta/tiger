const Clock = class {
    constructor(config) {
        this.date = undefined;
        this.jQuery = config.jquery;
        this.span = this.jQuery('span#clock').first();
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

        return this.span.text(HH + ':' + MM + ':' + SS);
    });

    format = (input => {
        if (input < 10) input = "0" + input;

        return input;
    });
};

export default Clock;
