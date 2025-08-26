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
package Tiger::Env::Config;

use strict;
use warnings;

use Modern::Perl;
use YAML;

use Tiger::Env;

sub new {
    my ( $class, $args ) = @_;
    my $self = {};
    my $env  = Tiger::Env->new;

    return
        unless $args->{'MOJO_CONF'} || $env->{'MOJO_CONF'};

    my $mojo_conf = $args->{'MOJO_CONF'} || $env->{'MOJO_CONF'};

    return
        unless -r $mojo_conf;

    $self = YAML::LoadFile($mojo_conf)
        or die;

    $self = $self->{'config'}->{'v1'}
        unless defined $args->{'CONTEXT'} and $args->{'CONTEXT'} eq 'full';

    return unless $self;

    bless( $self, $class );
    return $self;
}

1;
