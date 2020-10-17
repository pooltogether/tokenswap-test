const buidler = require('@nomiclabs/buidler')
const { expect } = require('chai')
const { ethers } = buidler
const { deployContract } = require('ethereum-waffle')
const ERC20Mintable = require('../artifacts/ERC20Mintable.json')
const TokenSwap = require('../artifacts/TokenSwap.json')

const toWei = ethers.utils.parseEther

describe('TokenSwap', () => {

  let swap, swap2, swap3

  let signer1, signer2

  let tokenA, tokenB

  beforeEach(async () => {
    [signer1, signer2, signer3] = await ethers.getSigners()
    tokenA = await deployContract(signer1, ERC20Mintable, ["Token A", "TOKA"])
    tokenB = await deployContract(signer1, ERC20Mintable, ["Token B", "TOKB"])
    swap = await deployContract(signer1, TokenSwap, [])
    swap2 = await swap.connect(signer2)
    swap3 = await swap.connect(signer3)
  })

  describe('supply()', () => {
    it('should allow a user to supply tokens', async () => {
      const suppliedAmount = toWei('1000')
      await tokenA.mint(signer1._address, suppliedAmount)
      await tokenA.approve(swap.address, suppliedAmount)
      await swap.supply(tokenA.address, suppliedAmount)
      expect(await swap.balanceOfUnderlying(signer1._address, tokenA.address)).to.equal(suppliedAmount)
    })


    it('should gives LPs a share across all tokens', async () => {
      const suppliedAmount = toWei('1000')
      await tokenA.mint(signer1._address, suppliedAmount)
      await tokenA.approve(swap.address, suppliedAmount)
      await swap.supply(tokenA.address, suppliedAmount)

      // Do a swap
      const swapAmount = toWei('100')
      await tokenB.mint(signer2._address, swapAmount)
      await tokenB.approve(swap.address, swapAmount)
      await swap2.swap(tokenB.address, swapAmount)

      // Pool now contains:
      //  - 905 Token A
      //  - 100 Token B

      const suppliedAmount2 = toWei('1005')
      await tokenA.mint(signer1._address, suppliedAmount2)
      await tokenA.approve(swap.address, suppliedAmount2)
      await swap.supply(tokenA.address, suppliedAmount2)

      // Pool Now contains:
      //  - 1910 Token A
      //  - 100 Token B

      // User 3 has supplied half of the liquidity, so they should get half of both tokens
      expect(await swap.balanceOfUnderlying(signer3._address, tokenA.address)).to.equal(toWei('955'))
      expect(await swap.balanceOfUnderlying(signer3._address, tokenB.address)).to.equal(toWei('50'))
    })
  })

  describe('swap()', () => {
    it('should allow a user to swap tokens', async () => {
      // First supply to market
      const suppliedAmount = toWei('1000')
      await tokenA.mint(signer1._address, suppliedAmount)
      await tokenA.approve(swap.address, suppliedAmount)
      await swap.supply(tokenA.address, suppliedAmount)

      const swapAmount = toWei('100')
      await tokenB.mint(signer2._address, swapAmount)
      await tokenB.approve(swap.address, swapAmount)
      await swap2.swap(tokenB.address, swapAmount)

      expect(await tokenB.balanceOf(signer2._address)).to.equal('0')
      // less 5% fee
      expect(await tokenA.balanceOf(signer2._address)).to.equal(toWei('95'))
    })
  })

  describe('redeem()', () => {
    it('should allow a user to get all of their shares back', async () => {
      const suppliedAmount = toWei('1000')
      await tokenA.mint(signer1._address, suppliedAmount)
      await tokenA.approve(swap.address, suppliedAmount)
      await swap.supply(tokenA.address, suppliedAmount)

      const shares = await swap.balanceOf(signer1._address)
      await swap.redeem(shares)

      expect(await tokenA.balanceOf(signer1._address)).to.equal(suppliedAmount)
    })

    it('should allow a user to capture fees', async () => {
      const suppliedAmount = toWei('1000')
      await tokenA.mint(signer1._address, suppliedAmount)
      await tokenA.approve(swap.address, suppliedAmount)
      await swap.supply(tokenA.address, suppliedAmount)

      // Do a swap
      const swapAmount = toWei('100')
      await tokenB.mint(signer2._address, swapAmount)
      await tokenB.approve(swap.address, swapAmount)
      await swap2.swap(tokenB.address, swapAmount)

      const shares = await swap.balanceOf(signer1._address)
      await swap.redeem(shares)

      expect(await tokenB.balanceOf(signer1._address)).to.equal(toWei('100'))
      // 5% fee
      expect(await tokenA.balanceOf(signer1._address)).to.equal(toWei('5'))
    })
  })

})