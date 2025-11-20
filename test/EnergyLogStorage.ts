import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers, fhevm } from "hardhat";
import { EnergyLogStorage, EnergyLogStorage__factory } from "../types";
import { expect } from "chai";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("EnergyLogStorage")) as EnergyLogStorage__factory;
  const energyLogStorageContract = (await factory.deploy()) as EnergyLogStorage;
  const energyLogStorageContractAddress = await energyLogStorageContract.getAddress();

  return { energyLogStorageContract, energyLogStorageContractAddress };
}

describe("EnergyLogStorage", function () {
  let signers: Signers;
  let energyLogStorageContract: EnergyLogStorage;
  let energyLogStorageContractAddress: string;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = { deployer: ethSigners[0], alice: ethSigners[1], bob: ethSigners[2] };
  });

  beforeEach(async function () {
    // Check whether the tests are running against an FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn(`This hardhat test suite cannot run on Sepolia Testnet`);
      this.skip();
    }

    ({ energyLogStorageContract, energyLogStorageContractAddress } = await deployFixture());
  });

  it("should have zero logs after deployment", async function () {
    const logCount = await energyLogStorageContract.getLogCount(signers.alice.address);
    expect(logCount).to.eq(0);
  });

  it("should add a new energy log entry", async function () {
    const date = "2024-01-15";
    const electricity = 100;
    const gas = 50;
    const water = 200;

    // Encrypt values
    const encryptedInput = await fhevm
      .createEncryptedInput(energyLogStorageContractAddress, signers.alice.address)
      .add64(BigInt(electricity))
      .add64(BigInt(gas))
      .add64(BigInt(water))
      .encrypt();

    const tx = await energyLogStorageContract
      .connect(signers.alice)
      .addEnergyLog(date, encryptedInput.handles[0], encryptedInput.handles[1], encryptedInput.handles[2], encryptedInput.inputProof);
    await tx.wait();

    const logCount = await energyLogStorageContract.getLogCount(signers.alice.address);
    expect(logCount).to.eq(1);

    const retrievedDate = await energyLogStorageContract.getDate(signers.alice.address, 0);
    expect(retrievedDate).to.eq(date);
  });

  it("should retrieve and decrypt energy log values", async function () {
    const date = "2024-01-20";
    const electricity = 150;
    const gas = 75;
    const water = 300;

    // Encrypt values
    const encryptedInput = await fhevm
      .createEncryptedInput(energyLogStorageContractAddress, signers.alice.address)
      .add64(BigInt(electricity))
      .add64(BigInt(gas))
      .add64(BigInt(water))
      .encrypt();

    const tx = await energyLogStorageContract
      .connect(signers.alice)
      .addEnergyLog(date, encryptedInput.handles[0], encryptedInput.handles[1], encryptedInput.handles[2], encryptedInput.inputProof);
    await tx.wait();

    // Retrieve encrypted values
    const encryptedElectricity = await energyLogStorageContract.getElectricity(signers.alice.address, 0);
    const encryptedGas = await energyLogStorageContract.getGas(signers.alice.address, 0);
    const encryptedWater = await energyLogStorageContract.getWater(signers.alice.address, 0);

    // Decrypt values
    const clearElectricity = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedElectricity,
      energyLogStorageContractAddress,
      signers.alice
    );
    const clearGas = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedGas,
      energyLogStorageContractAddress,
      signers.alice
    );
    const clearWater = await fhevm.userDecryptEuint(
      FhevmType.euint64,
      encryptedWater,
      energyLogStorageContractAddress,
      signers.alice
    );

    expect(clearElectricity).to.eq(BigInt(electricity));
    expect(clearGas).to.eq(BigInt(gas));
    expect(clearWater).to.eq(BigInt(water));
  });

  it("should allow multiple log entries", async function () {
    const dates = ["2024-01-15", "2024-01-16", "2024-01-17"];
    const values = [
      { electricity: 100, gas: 50, water: 200 },
      { electricity: 120, gas: 55, water: 220 },
      { electricity: 110, gas: 52, water: 210 },
    ];

    for (let i = 0; i < dates.length; i++) {
      const encryptedInput = await fhevm
        .createEncryptedInput(energyLogStorageContractAddress, signers.alice.address)
        .add64(BigInt(values[i].electricity))
        .add64(BigInt(values[i].gas))
        .add64(BigInt(values[i].water))
        .encrypt();

      const tx = await energyLogStorageContract
        .connect(signers.alice)
        .addEnergyLog(
          dates[i],
          encryptedInput.handles[0],
          encryptedInput.handles[1],
          encryptedInput.handles[2],
          encryptedInput.inputProof
        );
      await tx.wait();
    }

    const logCount = await energyLogStorageContract.getLogCount(signers.alice.address);
    expect(logCount).to.eq(3);

    // Verify each entry
    for (let i = 0; i < dates.length; i++) {
      const retrievedDate = await energyLogStorageContract.getDate(signers.alice.address, i);
      expect(retrievedDate).to.eq(dates[i]);
    }
  });

  it("should prevent access to out-of-bounds indices", async function () {
    await expect(energyLogStorageContract.getDate(signers.alice.address, 0)).to.be.revertedWith(
      "Index out of bounds"
    );
  });

  describe("Encrypted Token Functionality", function () {
    it("should mint tokens to a user", async function () {
      const amount = 1000;

      // Encrypt amount
      const encryptedInput = await fhevm
        .createEncryptedInput(energyLogStorageContractAddress, signers.deployer.address)
        .add64(BigInt(amount))
        .encrypt();

      // Mint tokens (BUG: No access control check in contract!)
      const tx = await energyLogStorageContract
        .connect(signers.deployer)
        .mint(signers.alice.address, encryptedInput.handles[0], encryptedInput.inputProof);
      await tx.wait();

      // Check balance
      const balance = await energyLogStorageContract.balanceOf(signers.alice.address);
      const decryptedBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        balance,
        energyLogStorageContractAddress,
        signers.alice
      );
      expect(decryptedBalance).to.eq(BigInt(amount));
    });

    it("should transfer tokens between users", async function () {
      const initialAmount = 1000;
      const transferAmount = 300;

      // First mint tokens to Alice
      const mintInput = await fhevm
        .createEncryptedInput(energyLogStorageContractAddress, signers.deployer.address)
        .add64(BigInt(initialAmount))
        .encrypt();

      await energyLogStorageContract
        .connect(signers.deployer)
        .mint(signers.alice.address, mintInput.handles[0], mintInput.inputProof);

      // Transfer from Alice to Bob
      const transferInput = await fhevm
        .createEncryptedInput(energyLogStorageContractAddress, signers.alice.address)
        .add64(BigInt(transferAmount))
        .encrypt();

      const tx = await energyLogStorageContract
        .connect(signers.alice)
        .transfer(signers.bob.address, transferInput.handles[0], transferInput.inputProof);
      await tx.wait();

      // Check balances
      const aliceBalance = await energyLogStorageContract.balanceOf(signers.alice.address);
      const bobBalance = await energyLogStorageContract.balanceOf(signers.bob.address);

      const decryptedAliceBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        aliceBalance,
        energyLogStorageContractAddress,
        signers.alice
      );
      const decryptedBobBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        bobBalance,
        energyLogStorageContractAddress,
        signers.bob
      );

      expect(decryptedAliceBalance).to.eq(BigInt(initialAmount - transferAmount));
      expect(decryptedBobBalance).to.eq(BigInt(transferAmount));
    });

    it("should approve and transfer from approved account", async function () {
      const initialAmount = 1000;
      const approveAmount = 500;
      const transferAmount = 200;

      // Mint tokens to Alice
      const mintInput = await fhevm
        .createEncryptedInput(energyLogStorageContractAddress, signers.deployer.address)
        .add64(BigInt(initialAmount))
        .encrypt();

      await energyLogStorageContract
        .connect(signers.deployer)
        .mint(signers.alice.address, mintInput.handles[0], mintInput.inputProof);

      // Alice approves Bob
      const approveInput = await fhevm
        .createEncryptedInput(energyLogStorageContractAddress, signers.alice.address)
        .add64(BigInt(approveAmount))
        .encrypt();

      await energyLogStorageContract
        .connect(signers.alice)
        .approve(signers.bob.address, approveInput.handles[0], approveInput.inputProof);

      // Bob transfers from Alice
      const transferInput = await fhevm
        .createEncryptedInput(energyLogStorageContractAddress, signers.bob.address)
        .add64(BigInt(transferAmount))
        .encrypt();

      const tx = await energyLogStorageContract
        .connect(signers.bob)
        .transferFrom(signers.alice.address, signers.deployer.address, transferInput.handles[0], transferInput.inputProof);
      await tx.wait();

      // Check balances
      const aliceBalance = await energyLogStorageContract.balanceOf(signers.alice.address);
      const deployerBalance = await energyLogStorageContract.balanceOf(signers.deployer.address);

      const decryptedAliceBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        aliceBalance,
        energyLogStorageContractAddress,
        signers.alice
      );
      const decryptedDeployerBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        deployerBalance,
        energyLogStorageContractAddress,
        signers.deployer
      );

      expect(decryptedAliceBalance).to.eq(BigInt(initialAmount - transferAmount));
      expect(decryptedDeployerBalance).to.eq(BigInt(transferAmount));
    });

    it("should reject transfer with zero balance", async function () {
      const transferAmount = 100;

      // Alice has no tokens initially
      const aliceBalance = await energyLogStorageContract.balanceOf(signers.alice.address);
      const decryptedBalance = await fhevm.userDecryptEuint(
        FhevmType.euint64,
        aliceBalance,
        energyLogStorageContractAddress,
        signers.alice
      );
      expect(decryptedBalance).to.eq(BigInt(0));

      // Try to transfer tokens from Alice (who has zero balance)
      const transferInput = await fhevm
        .createEncryptedInput(energyLogStorageContractAddress, signers.alice.address)
        .add64(BigInt(transferAmount))
        .encrypt();

      // FIX: This should fail due to insufficient balance
      await expect(
        energyLogStorageContract
          .connect(signers.alice)
          .transfer(signers.bob.address, transferInput.handles[0], transferInput.inputProof)
      ).to.be.revertedWith("Insufficient balance");
    });

    it("should reject transfer with zero amount", async function () {
      const initialAmount = 1000;
      const zeroAmount = 0;

      // First mint tokens to Alice
      const mintInput = await fhevm
        .createEncryptedInput(energyLogStorageContractAddress, signers.deployer.address)
        .add64(BigInt(initialAmount))
        .encrypt();

      await energyLogStorageContract
        .connect(signers.deployer)
        .mint(signers.alice.address, mintInput.handles[0], mintInput.inputProof);

      // Try to transfer zero amount
      const zeroTransferInput = await fhevm
        .createEncryptedInput(energyLogStorageContractAddress, signers.alice.address)
        .add64(BigInt(zeroAmount))
        .encrypt();

      // FIX: This should fail due to zero amount transfer
      await expect(
        energyLogStorageContract
          .connect(signers.alice)
          .transfer(signers.bob.address, zeroTransferInput.handles[0], zeroTransferInput.inputProof)
      ).to.be.revertedWith("Transfer amount must be positive");
    });

    // FIX: More edge case tests to be added in subsequent commits
  });
});

// Commit 5: style: format code with prettier
// Commit 13: test: add integration tests
