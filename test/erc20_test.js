const { expect } = require("chai")
const { ethers } = require("hardhat")
const { time, balance } = require("@openzeppelin/test-helpers")

let erc20
let owner, acc1, acc2

describe("Deploy TheToken", function () {
	beforeEach(async function () {
		let ERC20Token = await ethers.getContractFactory("BlocsportOne")

		signers = await ethers.getSigners()
		owner = signers[0]
		acc1 = signers[1]
		acc2 = signers[2]
		erc20 = await ERC20Token.deploy()
		await erc20.deployed()
	})

	it("Deployment should assign the total supply of tokens to the owner", async function () {
		const ownerBalance = await erc20.balanceOf(owner.address)
		expect(await erc20.totalSupply()).to.equal(ownerBalance)
	})

	it("Should transfer tokens between accounts", async function () {
		// Transfer 50 tokens from owner to addr1
		await erc20.transfer(acc1.address, 50)
		expect(await erc20.balanceOf(acc1.address)).to.equal(50)

		// Transfer 50 tokens from addr1 to addr2
		await erc20.connect(acc1).transfer(acc2.address, 50)
		expect(await erc20.balanceOf(acc2.address)).to.equal(50)
	})

	it("Should transfer accidentally sent ERC20 tokens to this contract", async function () {
		//deploy an erc20 token for
		let ERC20MockContract = await ethers.getContractFactory("ERC20Mock")
		erc20b = await ERC20MockContract.connect(acc1).deploy("ERCToken", "ERC", "10000")
		await erc20b.deployed()

		// Transfer some tokens to this contract
		await erc20b.connect(acc1).transfer(erc20.address, 100)
		expect(await erc20b.balanceOf(erc20.address)).to.equal(100)
		expect(await erc20b.balanceOf(owner.address)).to.equal(0)

		// get them
		await erc20.reclaimToken(erc20b.address)
		expect(await erc20b.balanceOf(owner.address)).to.equal(100)
	})
})
