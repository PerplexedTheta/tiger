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
        this.dom = this.jQuery('<div>')
        .attr('id', 'clock');

        let HH = this.format(this.date.getHours());
        let MM = this.format(this.date.getMinutes());
        let SS = this.format(this.date.getSeconds());

        let indicator = '<span style=\"visibility:hidden\">:</span>';
        if (this.date.getSeconds() % 2 == 0 || this.hideSecs == true)
            indicator = '<span>:</span>';

        this.dom.html('<span>' + HH + indicator + MM + '</span>');

        if (this.hideSecs != true)
            this.dom.append(' ' + '<small>'+ SS +'</small>');

        return this.jQuery('div#clock').first()
        .replaceWith(this.dom);
    });

    format = (input => {
        if (input < 10) input = "0" + input;

        return input;
    });
};

export default Clock;
