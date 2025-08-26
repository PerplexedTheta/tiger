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
package Tiger::API::Rail::Services;

use strict;
use warnings;

use HTTP::Request;
use JSON;
use LWP::UserAgent;
use Mojo::Base 'Mojolicious::Controller', -signatures;

use Tiger::Env::Config;

sub get {
    my ($app)        = @_;
    my ($controller) = $app->openapi->valid_input or return;
    my $json         = $controller->req->json;

    return $controller->render(
        status  => 404,
        openapi => {
            errors => [
                {
                    error   => 'not_found',
                    message => 'no tiploc_id found',
                }
            ],
        },
    ) unless $controller->param('tiploc_id');

    my $tiploc_id = $controller->param('tiploc_id');

    my $config  = Tiger::Env::Config->new;
    my $baseurl = $config->{api}->{upstream_api_url};

    my $request = HTTP::Request->new( 'GET', $baseurl . '/services/' . $tiploc_id );
    my $ua      = LWP::UserAgent->new;

    $request->header( 'User-Agent'                          => 'perl/"$^V' );
    $request->header( 'Content-Type'                        => 'application/json' );
    $request->header( $config->{api}->{upstream_api_header} => $config->{api}->{upstream_api_key} );

    my $response = $ua->request($request);
    my $content  = JSON->new->decode( $response->{_content} );

    return $controller->render(
        openapi => $content,
    );
}

1;
