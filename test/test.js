var should = require('should'),
    dyna = require('../dynamight.js');

describe('Async Tasks', function(){
  describe('.now()', function(){
    describe('Sanity', function(){
      it('No arguments', function(){
        should.not.exist(dyna().now());
      })

      it('Ignored if after .finished()', function(){
        dyna().now(returnGiven, 3).finished().now(returnGiven, 3).results.length.should.equal(1);
      })
    })

    describe('Functionality', function(){
      it('Returns :: correct indices', function(){
        var results = dyna().now(returnGiven, 1).now(returnGiven, 2).now(returnGiven, 3).results;
        results[0].should.equal(1);
        results[1].should.equal(2);
        results[2].should.equal(3);
      })

      it('Multiple arguments', function(){
        dyna().now(addGiven, 1, 4).results[0].should.equal(5);
      })
    })
  })

  describe('.then()', function(){
    describe('Sanity', function(){
      it('No previous .now()', function(){
        should.not.exist(dyna().then(nop));
      })

      it('Too many arguments', function(){
        should.not.exist(dyna().now(returnGiven, 1).then(addGiven));
      })

      it('Slice full results array', function(done){
        dyna()
          .now(returnGiven, 1)
          .now(returnGiven, 1)
          .then(addGiven)
          .finished(done)
          .results.length.should.equal(1);
      })

      it('Slice unfull results array', function(done){
        dyna()
          .now(returnGiven, 1)
          .now(returnGiven, 1)
          .now(returnGiven, 1)
          .then(addGiven)
          .finished(done)
          .results.length.should.equal(2);
      })
    })

    describe('Functionality', function(){
      it('Add two numbers', function(done){
        dyna()
          .now(returnGiven, 1)
          .now(returnGiven, 4)
          .then(addGiven)
          .finished(done)
          .results[0].should.equal(5);
      })
    })
  })


  describe('.finished()', function() {
    describe('Sanity', function(){
      it('No previous .now()', function(){
        should.not.exist(dyna().finished(nop));
      })
    })

    describe('Functionality', function(){
      it('Default nop', function(){
        dyna()
          .now(returnGiven, 1)
          .finished()
          .results.length.should.equal(1);
      })

      it('Pass arguments', function(done){
        console.log('\n-----------------------------------------------');
        console.log("Errors aren't currently passed :(");
        console.log("Will take an hour or so but as of now it fails");
        console.log('rather specatcularly');
        console.log('-----------------------------------------------');
        dyna()
          .now(returnGiven, 3)
          .finished(function(e, r){
            r[0].should.equal(3);
            r.length.should.equal(1);
            done();
          })
      })
    })
  })
})

describe('Chained Calls', function(){
  it('.now().then().now()', function(done){
    dyna()
      .now(returnGiven, 1)
      .then(addFive)
      .now(returnGiven,2)
      .finished(function(e,r){
        r.length.should.equal(2);
        r[0].should.equal(6);
        r[1].should.equal(2);
        done();
      })
  })
})



function nop() {}
function returnGiven(a) { return a; }
function addGiven(a, b) { return a + b; }
function addFive(a) { return 5 + a; }