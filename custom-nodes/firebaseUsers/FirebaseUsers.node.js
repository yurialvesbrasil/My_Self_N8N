// /home/node/.n8n/custom/firebase/Firebase.node.js
const { INodeType, INodeTypeDescription } = require('n8n-workflow');
const admin = require('firebase-admin');

class FirebaseUsers {
    constructor() {
        this.description = {
            displayName: 'Firebase List Users',
            name: 'firebaseUsers',
            group: ['transform'],
            version: 1,
            description: 'Executa ações com Firebase Admin SDK para lista os usuários do Firebase',
            defaults: { name: 'Firebase List Users' },
            inputs: ['main'],
            outputs: ['main'],
            properties: [
                {
                    displayName: 'Service Account JSON',
                    name: 'serviceAccount',
                    type: 'string',
                    default: '',
                    description: 'Conteúdo do arquivo de credenciais JSON do Firebase',
                },
            ],
        };
    }

    async execute() {
        const serviceAccount = JSON.parse(this.getNodeParameter('serviceAccount', 0));

        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`,
            });
        }

        const list = await admin.auth().listUsers();
        return this.prepareOutputData(
            list.users.map(u => ({
                json: {
                    uid: u.uid,
                    email: u.email,
                    displayName: u.displayName || null,
                    disabled: u.disabled,
                    provider: u.providerData?.[0]?.providerId || null,
                },
            }))
        );

    }
}

module.exports = { FirebaseUsers };
