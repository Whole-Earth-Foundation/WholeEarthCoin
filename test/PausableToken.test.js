const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const WholeEarthCoinToken = artifacts.require('WholeEarthCoinToken');
const initialBalance = new BN('1000000000000000000000000000');

contract('WholeEarthCoinToken - Pausable', function ([_, owner, recipient, anotherAccount]) {
  beforeEach(async function () {
    this.token = await WholeEarthCoinToken.new(owner, initialBalance);
  });

  describe('pausable token', function () {
    describe('paused', function () {
      it('is not paused by default', async function () {
        expect(await this.token.paused()).to.equal(false);
      });

      it('is paused after being paused', async function () {
        await this.token.pause();
        expect(await this.token.paused()).to.equal(true);
      });

      it('is not paused after being paused and then unpaused', async function () {
        await this.token.pause();
        await this.token.unpause();
        expect(await this.token.paused()).to.equal(false);
      });
    });

    describe('transfer', function () {
      it('allows to transfer when unpaused', async function () {
        await this.token.transfer(recipient, initialBalance, { from: owner });

        expect(await this.token.balanceOf(owner)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(initialBalance);
      });

      it('allows to transfer when paused and then unpaused', async function () {
        await this.token.pause();
        await this.token.unpause();

        await this.token.transfer(recipient, initialBalance, { from: owner });

        expect(await this.token.balanceOf(owner)).to.be.bignumber.equal('0');
        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(initialBalance);
      });

      it('reverts when trying to transfer when paused', async function () {
        await this.token.pause();

        await expectRevert(this.token.transfer(recipient, initialBalance, { from: owner }),
          'Pausable: paused.'
        );
      });
    });

    describe('transfer from', function () {
      const allowance = new BN(40);

      beforeEach(async function () {
        await this.token.approve(anotherAccount, allowance, { from: owner });
      });

      it('allows to transfer from when unpaused', async function () {
        await this.token.transferFrom(owner, recipient, allowance, { from: anotherAccount });

        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(allowance);
        expect(await this.token.balanceOf(owner)).to.be.bignumber.equal(initialBalance.sub(allowance));
      });

      it('allows to transfer when paused and then unpaused', async function () {
        await this.token.pause();
        await this.token.unpause();

        await this.token.transferFrom(owner, recipient, allowance, { from: anotherAccount });

        expect(await this.token.balanceOf(recipient)).to.be.bignumber.equal(allowance);
        expect(await this.token.balanceOf(owner)).to.be.bignumber.equal(initialBalance.sub(allowance));
      });

      it('reverts when trying to transfer from when paused', async function () {
        await this.token.pause();

        await expectRevert(this.token.transferFrom(
          owner, recipient, allowance, { from: anotherAccount }), 'Pausable: paused.'
        );
      });
    });

    describe('approve', function () {
      it('allows to approve when unpaused', async function () {
        await this.token.approve(anotherAccount, 40, { from: owner });

        expect(await this.token.allowance(owner, anotherAccount)).to.be.bignumber.equal('40');
      });

      it('allows to transfer when paused and then unpaused', async function () {
        await this.token.pause();
        await this.token.unpause();

        await this.token.approve(anotherAccount, 40, { from: owner });

        expect(await this.token.allowance(owner, anotherAccount)).to.be.bignumber.equal('40');
      });

      it('reverts when trying to transfer when paused', async function () {
        await this.token.pause();

        await expectRevert(
          this.token.approve(anotherAccount, 40, { from: owner }),
          'Pausable: paused.'
        );
      });
    });

    describe('increase approval', function () {
      beforeEach(async function () {
        await this.token.approve(anotherAccount, initialBalance, { from: owner });
      });

      it('allows to increase approval when unpaused', async function () {
        const amount = 40;
        await this.token.increaseAllowance(anotherAccount, amount, { from: owner });

        expect(await this.token.allowance(owner, anotherAccount)).to.be.bignumber.equal(initialBalance.addn(amount));
      });

      it('allows to increase approval when paused and then unpaused', async function () {
        await this.token.pause();
        await this.token.unpause();

        const amount = 40;
        await this.token.increaseAllowance(anotherAccount, amount, { from: owner });

        expect(await this.token.allowance(owner, anotherAccount)).to.be.bignumber.equal(initialBalance.addn(amount));
      });

      it('reverts when trying to increase approval when paused', async function () {
        await this.token.pause();

        await expectRevert(
          this.token.increaseAllowance(anotherAccount, 40, { from: owner }),
          'Pausable: paused.'
        );
      });
    });

    describe('decrease approval', function () {
      beforeEach(async function () {
        await this.token.approve(anotherAccount, initialBalance, { from: owner });
      });

      it('allows to decrease approval when unpaused', async function () {
        const amount = 40;
        await this.token.decreaseAllowance(anotherAccount, amount, { from: owner });

        expect(await this.token.allowance(owner, anotherAccount)).to.be.bignumber.equal(initialBalance.subn(amount));
      });

      it('allows to decrease approval when paused and then unpaused', async function () {
        await this.token.pause();
        await this.token.unpause();

        const amount = 40;
        await this.token.decreaseAllowance(anotherAccount, amount, { from: owner });

        expect(await this.token.allowance(owner, anotherAccount)).to.be.bignumber.equal(initialBalance.subn(amount));
      });

      it('reverts when trying to transfer when paused', async function () {
        await this.token.pause();

        await expectRevert(
          this.token.decreaseAllowance(anotherAccount, 40, { from: owner }),
          'Pausable: paused.'
        );
      });
    });
  });
});