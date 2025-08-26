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
package Tiger::Controller::Errors;

use strict;
use warnings;

use Modern::Perl;
use Mojo::Base 'Mojolicious::Controller', -signatures;

our $error_map = {
    forbidden => 'Forbidden',
    not_found => 'Not Found',
};

sub forbidden {
    my ($controller) = @_ or return;
    my ($app)        = $controller->app;

    ## render the template
    return $controller->render(
        status   => '403',
        error    => $error_map->{forbidden},
        message  => 'This document or endpoint is not consumable by the public. Please try again.',
        template => 'errors',
        handler  => 'tt2',
    );
}

sub not_found {
    my ($controller) = @_ or return;
    my ($app)        = $controller->app;

    ## render the template
    return $controller->render(
        status   => '404',
        error    => $error_map->{not_found},
        message  => 'This document or endpoint does not exist. Please try again.',
        template => 'errors',
        handler  => 'tt2',
    );
}

1;
