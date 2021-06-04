const { BN, constants, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const WholeEarthCoinToken = artifacts.require('WholeEarthCoinToken');
const { ZERO_ADDRESS } = constants;
const initialBalance = new BN('1000000000000000000000000000');

const { expect } = require('chai');

contract('WholeEarthCoinToken - Standard', function([_, owner, recipient, anotherAccount]) {
  beforeEach(async function() {
    this.token = await WholeEarthCoinToken.new(owner, initialBalance);
  });

  describe('total supply', function() {
    it('returns the total amount of tokens', async function() {
      const totalSupply = await this.token.totalSupply();
      expect(totalSupply).to.be.bignumber.equal(initialBalance);
    });
  });

  describe('balanceOf', function() {
    describe('when the requested account has no tokens', function() {
      it('returns zero', async function() {
        const balance = await this.token.balanceOf(anotherAccount);
        expect(balance).to.be.bignumber.equal('0');
      });
    });

    describe('when the requested account has some tokens', function() {
      it('returns the total amount of tokens', async function() {
        const balance = await this.token.balanceOf(owner);
        expect(balance).to.be.bignumber.equal(initialBalance);
      });
    });
  });

  describe('transfer', function() {
    describe('when the recipient is not the zero address', function() {
      const to = recipient;

      describe('when the sender does not have enough balance', function() {
        const amount = initialBalance.addn(1);

        it('reverts', async function() {
          await expectRevert(
            this.token.transfer(to, amount, { from: owner }),
            'ERC20: transfer amount exceeds balance'
          );
        });
      });

      describe('when the sender has enough balance', function() {
        const amount = initialBalance;

        it('transfers the requested amount', async function() {
          await this.token.transfer(to, amount, { from: owner });

          const senderBalance = await this.token.balanceOf(owner);
          expect(senderBalance).to.be.bignumber.equal('0');

          const recipientBalance = await this.token.balanceOf(to);
          expect(recipientBalance).to.be.bignumber.equal(amount);
        });

        it('emits a transfer event', async function() {
          const { logs } = await this.token.transfer(to, amount, {
            from: owner,
          });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Transfer');
          assert.equal(logs[0].args.from, owner);
          assert.equal(logs[0].args.to, to);
          assert(logs[0].args.value.eq(amount));
        });
      });
    });

    describe('when the recipient is the zero address', function() {
      const to = ZERO_ADDRESS;

      it('reverts', async function() {
        await expectRevert(
          this.token.transfer(to, initialBalance, { from: owner }),
          'ERC20: transfer to the zero address'
        );
      });
    });
  });

  describe('approve', function() {
    describe('when the spender is not the zero address', function() {
      const spender = recipient;

      describe('when the sender has enough balance', function() {
        const amount = initialBalance;

        it('emits an approval event', async function() {
          const { logs } = await this.token.approve(spender, amount, {
            from: owner,
          });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.spender, spender);
          assert(logs[0].args.value.eq(amount));
        });

        describe('when there was no approved amount before', function() {
          it('approves the requested amount', async function() {
            await this.token.approve(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            expect(allowance).to.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function() {
          beforeEach(async function() {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function() {
            await this.token.approve(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            expect(allowance).to.be.bignumber.equal(amount);
          });
        });
      });

      describe('when the sender does not have enough balance', function() {
        const amount = initialBalance.addn(1);

        it('emits an approval event', async function() {
          const { logs } = await this.token.approve(spender, amount, {
            from: owner,
          });

          assert.equal(logs.length, 1);
          assert.equal(logs[0].event, 'Approval');
          assert.equal(logs[0].args.owner, owner);
          assert.equal(logs[0].args.spender, spender);
          assert(logs[0].args.value.eq(amount));
        });

        describe('when there was no approved amount before', function() {
          it('approves the requested amount', async function() {
            await this.token.approve(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            expect(allowance).to.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function() {
          beforeEach(async function() {
            await this.token.approve(spender, 1, { from: owner });
          });

          it('approves the requested amount and replaces the previous one', async function() {
            await this.token.approve(spender, amount, { from: owner });

            const allowance = await this.token.allowance(owner, spender);
            expect(allowance).to.be.bignumber.equal(amount);
          });
        });
      });
    });

    describe('when the spender is the zero address', function() {
      const amount = initialBalance;
      const spender = ZERO_ADDRESS;

      it('reverts', async function() {
        await expectRevert(
          this.token.approve(spender, amount, { from: owner }),
          'ERC20: approve to the zero address'
        );
      });
    });
  });

  describe('transfer from', function() {
    const spender = recipient;

    describe('when the recipient is not the zero address', function() {
      const to = anotherAccount;

      describe('when the spender has enough approved balance', function() {
        beforeEach(async function() {
          await this.token.approve(spender, initialBalance, { from: owner });
        });

        describe('when the owner has enough balance', function() {
          const amount = initialBalance;

          it('transfers the requested amount', async function() {
            await this.token.transferFrom(owner, to, amount, { from: spender });

            const senderBalance = await this.token.balanceOf(owner);
            expect(senderBalance).to.be.bignumber.equal('0');

            const recipientBalance = await this.token.balanceOf(to);
            expect(recipientBalance).to.be.bignumber.equal(amount);
          });

          it('decreases the spender allowance', async function() {
            await this.token.transferFrom(owner, to, amount, { from: spender });

            const allowance = await this.token.allowance(owner, spender);
            expect(allowance).to.be.bignumber.equal('0');
          });

          it('emits a transfer event', async function () {
            const { logs } = await this.token.transferFrom(owner, to, amount, { from: spender });

            expectEvent.inLogs(logs, 'Transfer', {
              from: owner,
              to: to,
              value: amount,
            });
          });

          it('emits an approval event', async function () {
            const { logs } = await this.token.transferFrom(owner, to, amount, { from: spender });

            expectEvent.inLogs(logs, 'Approval', {
              owner: owner,
              spender: spender,
              value: await this.token.allowance(owner, spender),
            });
          });
        });

        describe('when the owner does not have enough balance', function() {
          const amount = initialBalance.addn(1);

          it('reverts', async function() {
            await expectRevert(
              this.token.transferFrom(owner, to, amount, { from: spender }),
              'ERC20: transfer amount exceeds balance'
            );
          });
        });
      });

      describe('when the spender does not have enough approved balance', function() {
        beforeEach(async function() {
          await this.token.approve(spender, initialBalance.subn(1), {
            from: owner,
          });
        });

        describe('when the owner has enough balance', function() {
          const amount = initialBalance;

          it('reverts', async function() {
            await expectRevert(
              this.token.transferFrom(owner, to, amount, { from: spender }),
              'ERC20: transfer amount exceeds allowance'
            );
          });
        });

        describe('when the owner does not have enough balance', function() {
          const amount = initialBalance.addn(1);

          it('reverts', async function() {
            await expectRevert(
              this.token.transferFrom(owner, to, amount, { from: spender }),
              'ERC20: transfer amount exceeds balance'
            );
          });
        });
      });
    });

    describe('when the recipient is the zero address', function() {
      const amount = initialBalance;
      const to = ZERO_ADDRESS;

      beforeEach(async function() {
        await this.token.approve(spender, amount, { from: owner });
      });

      it('reverts', async function() {
        await expectRevert(
          this.token.transferFrom(owner, to, amount, { from: spender }),
          'ERC20: transfer to the zero address'
        );
      });
    });
  });

  describe('decrease approval', function() {

    describe('when the spender is not the zero address', function() {
      const spender = recipient;

      function shouldDecreaseApproval (amount) {
        describe('when there was no approved amount before', function () {
          it('reverts', async function () {
            await expectRevert(this.token.decreaseAllowance(
              spender, amount, { from: owner }), 'ERC20: decreased allowance below zero'
            );
          });
        });

        describe('when the spender had an approved amount', function () {
          const approvedAmount = amount;

          beforeEach(async function () {
            ({ logs: this.logs } = await this.token.approve(spender, approvedAmount, { from: owner }));
          });

          it('emits an approval event', async function () {
            const { logs } = await this.token.decreaseAllowance(spender, approvedAmount, { from: owner });

            expectEvent.inLogs(logs, 'Approval', {
              owner: owner,
              spender: spender,
              value: new BN(0),
            });
          });

          it('decreases the spender allowance subtracting the requested amount', async function () {
            await this.token.decreaseAllowance(spender, approvedAmount.subn(1), { from: owner });

            expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal('1');
          });

          it('sets the allowance to zero when all allowance is removed', async function () {
            await this.token.decreaseAllowance(spender, approvedAmount, { from: owner });
            expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal('0');
          });

          it('reverts when more than the full allowance is removed', async function () {
            await expectRevert(
              this.token.decreaseAllowance(spender, approvedAmount.addn(1), { from: owner }),
              'ERC20: decreased allowance below zero'
            );
          });
        });
      }

      describe('when the sender has enough balance', function () {
        const amount = initialBalance;

        shouldDecreaseApproval(amount);
      });

      describe('when the sender does not have enough balance', function () {
        const amount = initialBalance.addn(1);

        shouldDecreaseApproval(amount);
      });
    });

    describe('when the spender is the zero address', function() {
      const amount = initialBalance;
      const spender = ZERO_ADDRESS;

      it('reverts', async function () {
        await expectRevert(
          this.token.decreaseAllowance(spender, amount, { from: owner }),
          'ERC20: decreased allowance below zero'
        );
      });

    });
  });

  describe('increase approval', function() {
    const amount = initialBalance;

    describe('when the spender is not the zero address', function() {
      const spender = recipient;

      describe('when the sender has enough balance', function () {
        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseAllowance(spender, amount, { from: owner });

          expectEvent.inLogs(logs, 'Approval', {
            owner: owner,
            spender: spender,
            value: amount,
          });
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: owner });

            expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), { from: owner });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: owner });

            expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal(amount.addn(1));
          });
        });
      });

      describe('when the sender does not have enough balance', function () {
        const amount = initialBalance.addn(1);

        it('emits an approval event', async function () {
          const { logs } = await this.token.increaseAllowance(spender, amount, { from: owner });

          expectEvent.inLogs(logs, 'Approval', {
            owner: owner,
            spender: spender,
            value: amount,
          });
        });

        describe('when there was no approved amount before', function () {
          it('approves the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: owner });

            expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal(amount);
          });
        });

        describe('when the spender had an approved amount', function () {
          beforeEach(async function () {
            await this.token.approve(spender, new BN(1), { from: owner });
          });

          it('increases the spender allowance adding the requested amount', async function () {
            await this.token.increaseAllowance(spender, amount, { from: owner });

            expect(await this.token.allowance(owner, spender)).to.be.bignumber.equal(amount.addn(1));
          });
        });
      });
    });

    describe('when the spender is the zero address', function() {
      const spender = ZERO_ADDRESS;
      it('reverts', async function () {
        await expectRevert(
          this.token.increaseAllowance(spender, amount, { from: owner }),
          'ERC20: approve to the zero address'
        );
      });
    });
  });
});