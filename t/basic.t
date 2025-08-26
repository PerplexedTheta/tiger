use strict;
use warnings;

use Mojo::File qw(curfile);
use lib curfile->dirname->sibling('lib')->to_string;

use Mojo::Base -strict;

use Test::More;
use Test::Mojo;

my $t = Test::Mojo->new('App');
$t->get_ok('/')->status_is(200)->content_like(qr/Mojolicious/i);

done_testing();
