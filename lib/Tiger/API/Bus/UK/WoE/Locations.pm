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
package Tiger::API::Bus::UK::WoE::Locations;

use strict;
use warnings;

use HTTP::Request;
use JSON;
use LWP::UserAgent;
use Mojo::Base 'Mojolicious::Controller', -signatures;

use Tiger::Env::Config;

sub list {
    my ($app)        = @_;
    my ($controller) = $app->openapi->valid_input or return;

    my $location = $controller->param('location') || '51.4515621%2C-2.6050402';

    my $config  = Tiger::Env::Config->new;
    my $baseurl = $config->{bus}->{woe}->{api}->{upstream_api_url}->{v3};

    my $request = HTTP::Request->new(
        'GET',
        $baseurl
            . '/nearby?brand_ids=Bluestar%2CCardiffBus%2CNewportBus%2CFirst%2CPlymouthCitybus%2CStagecoach%2CTransportCornwall%2CBusesofSomerset%2CMoreBus%2CSalisburyReds%2CSouthernVectis%2CSwindonBusCompany%2CTrawsCymru%2CGenericUKBus%2CUKNationalExpress&location='
            . $location
            . '&region_id=uk-bristol&mode_id=uk-bristol-bus'
    );
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
