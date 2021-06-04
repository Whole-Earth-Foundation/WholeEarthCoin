const { BN } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');;

const WholeEarthCoinToken = artifacts.require('WholeEarthCoinToken');
const initialBalance = new BN('1000000000000000000000000000');

contract('WholeEarthCoinToken - Detail', accounts => {
  const _name = 'WholeEarthCoin';
  const _symbol = 'WEC';
  const _decimals = new BN(18);

  beforeEach(async function() {
    this.detailedERC20 = await WholeEarthCoinToken.new(accounts[0], initialBalance);
  });

  it('has a name', async function() {
    const name = await this.detailedERC20.name();
    expect(name).to.equal(_name);
  });

  it('has a symbol', async function() {
    const symbol = await this.detailedERC20.symbol();
    expect(symbol).to.equal(_symbol);
  });

  it('has an amount of decimals', async function() {
    const decimals = await this.detailedERC20.decimals();
    expect(decimals).to.be.bignumber.equal(_decimals);
  });
});