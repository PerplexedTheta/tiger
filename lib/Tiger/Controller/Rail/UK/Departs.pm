#   This file is part of tiger
#
#   Copyright 2025 PerplexedTheta
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
package Tiger::Controller::Rail::UK::Departs;

use strict;
use warnings;

use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller', -signatures;

sub departs {
    my ($controller) = @_ or return;
    my ($app)        = $controller->app;

    my $tiploc_id = $controller->param('tiploc_id');
    return
        unless $tiploc_id;

    my $disable_animation = ( $controller->param('disable_animation') ) ? 1 : undef;
    my $greyscale         = ( $controller->param('greyscale') ) ? 'greyscale' : undef;
    my $hide_calls        = ( $controller->param('hide_calls') ) ? 1 : undef;
    my $hide_secs         = ( $controller->param('hide_secs') ) ? 1 : undef;

    ## render the template
    return $controller->render(
        disable_animation  => $disable_animation,
        greyscale          => $greyscale,
        hide_calls         => $hide_calls,
        hide_secs          => $hide_secs,
        tiploc_id          => $tiploc_id,
        title              => 'Departures from ' . $tiploc_id,
        template           => 'rail/uk/departs',
        handler            => 'tt2',
    );
}

1;
