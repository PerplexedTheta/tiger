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
package Tiger::API::Bus::CityBus::Services;

use strict;
use warnings;

use HTTP::Request;
use JSON;
use LWP::UserAgent;
use Mojo::Base 'Mojolicious::Controller', -signatures;
use Mojo::DOM;

use Tiger::Env::Config;

sub get {
    my ($app)        = @_;
    my ($controller) = $app->openapi->valid_input or return;
    my $json         = $controller->req->json;

    my $stop_id = $controller->param('stop_id');

    my $config  = Tiger::Env::Config->new;
    my $baseurl = $config->{bus}->{CityBus}->{api}->{upstream_api_url};

    my $request = HTTP::Request->new( 'GET', $baseurl . '/stops/' . $stop_id );
    my $ua      = LWP::UserAgent->new;

    $request->header( 'User-Agent' => 'perl/"$^V' );

    #$request->header( 'X-Requested-With' => 'XMLHttpRequest' );

    my $response = $ua->request($request);

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
    ) unless $controller->param('stop_id') and $response->{_rc} == 200;

    my ( $name, $tablet ) = _process_metadata( $response->{_content} );

    my $name = $name . ' ' . $tablet
        if $tablet;

    my $services = _process_timetable( $response->{_content} );

    return $controller->render(
        openapi => {
            id       => $stop_id,
            name     => $name,
            services => $services,
        }
    );
}

sub _process_metadata {
    my ($content) = @_;
    my $dom = Mojo::DOM->new($content);
    my ( $name, $tablet );

    $name = $dom->at('h1.place-info-banner__name')->text
        if $dom->at('h1.place-info-banner__name');
    $tablet = $dom->at('span.place-info-banner__tablet')->text
        if $dom->at('span.place-info-banner__tablet');

    $name =~ s/^\s+|\s+$//g;
    $tablet =~ s/^\s+|\s+$//g;

    return ( $name, $tablet );
}

sub _process_timetable {
    my ($content) = @_;
    my $dom = Mojo::DOM->new($content);
    my @array;

    $dom->find('li.departure-board__item')->each(
        sub {
            return
                unless defined $_->at('div.single-visit__name')->text;

            my $object = {
                line => $_->at('div.single-visit__name')->text,
                dest => $_->at('div.single-visit__description')->text,
                etd  => $_->at('div.single-visit__arrival-time div.single-visit__arrival-time__cell')->text,
                rtpi => ( $_->at('div.real-time-animation') ) ? JSON::true : JSON::false,
            };

            push @array, $object;
        }
    );

    return \@array;
}

1;
