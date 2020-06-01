const { FileSystemWallet, Gateway, X509WalletMixin } = require("fabric-network");
const path = require("path");

const ccp = require("../ccp/connection-forensics.json");

RegisterUser = async (user) => {
    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(process.cwd(), "wallet_forensics");
    const wallet = new FileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: "admin", discovery: { enabled: true, asLocalhost: true } });

    // Get the CA client object from the gateway for interacting with the CA.
    const ca = gateway.getClient().getCertificateAuthority();
    const adminIdentity = gateway.getCurrentIdentity();

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register(
        { affiliation: "org1.department1", enrollmentID: user.username, role: "client" },
        adminIdentity
    );
    const enrollment = await ca.enroll({ enrollmentID: user.username, enrollmentSecret: secret });
    const userIdentity = X509WalletMixin.createIdentity(
        "ForensicsMSP",
        enrollment.certificate,
        enrollment.key.toBytes()
    );
    await wallet.import(user.username, userIdentity);
};

module.exports = RegisterUser;