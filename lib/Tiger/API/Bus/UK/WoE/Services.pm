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
package Tiger::API::Bus::UK::WoE::Services;

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

    my $stopId = $controller->param('stop_id');

    return $controller->render(
        status  => 404,
        openapi => {
            errors => [
                {
                    error   => 'not_found',
                    message => 'no stop_id found',
                }
            ],
        },
    ) unless $stopId;

    my $config  = Tiger::Env::Config->new;
    my $baseurl = $config->{bus}->{woe}->{api}->{upstream_api_url}->{v1};

    my $request =
        HTTP::Request->new( 'GET', $baseurl . '/departures?headways=1&ids=' . $stopId . '&region_id=uk-bristol' );
    my $ua = LWP::UserAgent->new;

    $request->header( 'User-Agent'   => 'perl/"$^V' );
    $request->header( 'Content-Type' => 'application/json' );

    my $response = $ua->request($request);
    my $content  = JSON->new->decode( $response->{_content} );

    return $controller->render(
        openapi => $content,
    );
}

1;
