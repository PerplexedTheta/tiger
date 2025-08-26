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
package Tiger;

use strict;
use warnings;

use Modern::Perl;
use Mojo::Base 'Mojolicious', -signatures;

use Tiger::API;
use Tiger::Controller;
use Tiger::Env::Config;

sub startup {
    my ($app) = @_ or die 'no app available';

    # Load configuration from config file
    my $config = Tiger::Env::Config->new( { CONTEXT => 'full' } )
        or die 'no config available';

    # Configure the application
    $app->secrets( $config->{secrets} );

    ## stash
    $app->defaults();

    ## types
    $app->types->type( mjs => 'text/javascript' );

    ## api controller
    my $api = Tiger::API->new(
        {
            app      => $app,
            rel_file => 'swagger.yml',
        }
    ) or die 'no api available';

    ## web controller
    my $controller = Tiger::Controller->new( { app => $app } )
        or die 'no controller available';
    $controller->plugins;
    $controller->routes;

    return 1;
}

1;
