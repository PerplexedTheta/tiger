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
package Tiger::Controller;

use strict;
use warnings;

use Modern::Perl;

use Tiger::Controller::Index;

sub new {
    my ( $class, $args ) = @_;
    my $self = {};

    $self->{'app'} = $args->{'app'}
        or return;

    bless( $self, $class );
    return $self;
}

sub plugins {
    my ($self) = @_;

    return $self->{'app'}->plugin(
        'TemplateToolkit' => {
            template => {
                INCLUDE_PATH => $self->{'app'}->home->rel_file('templates/'),
                INTERPOLATE  => 1
            }
        }
    );
}

sub routes {
    my ($self) = @_;
    my $r = $self->{'app'}->routes
        or return;

    ## set routes
    $r->get('/rail/:tiploc_id')->to(
        namespace  => 'Tiger',
        controller => 'Controller::Rail::Index',
        action     => 'mainpage',
    );
    $r->any('/')->to(
        namespace  => 'Tiger',
        controller => 'Controller::Errors',
        action     => 'forbidden',
    );
    $r->any('*')->to(
        namespace  => 'Tiger',
        controller => 'Controller::Errors',
        action     => 'not_found',
    );

    return $r;
}

1;
