// /home/node/.n8n/custom/firebase/FirebaseDeleteUser.node.js
const { INodeType, INodeTypeDescription } = require('n8n-workflow');
const admin = require('firebase-admin');

class FirebaseDeleteUser {
  constructor() {
    this.description = {
      displayName: 'Firebase Delete User',
      name: 'firebaseDeleteUser',
      group: ['transform'],
      version: 1,
      description: 'Remove um usuário do Firebase Authentication usando o UID',
      defaults: { name: 'Firebase Delete User' },
      inputs: ['main'],
      outputs: ['main'],
      properties: [
        {
          displayName: 'Service Account JSON',
          name: 'serviceAccount',
          type: 'string',
          default: '',
          description: 'Conteúdo do arquivo de credenciais JSON do Firebase',
          required: true,
          typeOptions: {
            multiline: true, // Permite colar o JSON em várias linhas
          },
        },
        {
          displayName: 'User UID',
          name: 'uid',
          type: 'string',
          default: '',
          description: 'O UID do usuário a ser removido no Firebase Authentication',
          required: true,
        },
      ],
    };
  }

  async execute() {
    const items = this.getInputData();
    const returnData = [];

    for (let i = 0; i < items.length; i++) {
      const serviceAccountJson = this.getNodeParameter('serviceAccount', i);
      const uid = this.getNodeParameter('uid', i);

      let firebaseApp;
      try {
        // Tenta inicializar o app Firebase se ainda não foi inicializado
        // Verifica se o app já existe pelo nome. Se existir, usa o existente.
        if (admin.apps.length === 0 || !admin.apps.some(app => app.name === 'customNodeApp')) {
          const serviceAccount = JSON.parse(serviceAccountJson);
          firebaseApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          }, 'customNodeApp'); // Usa um nome único para o app
        } else {
            firebaseApp = admin.app('customNodeApp');
        }

        const auth = firebaseApp.auth();

        // **Lógica Principal: Deletar o usuário**
        await auth.deleteUser(uid);

        // Retorna sucesso para o n8n
        returnData.push({
          json: {
            success: true,
            uidDeleted: uid,
            message: `Usuário com UID '${uid}' deletado com sucesso.`,
          },
        });

      } catch (error) {
        // Em caso de erro, lança um erro para o n8n
        this.log('error', `Erro ao deletar usuário ${uid}: ${error.message}`);
        
        // Adiciona a informação de erro no item de retorno
        returnData.push({
          json: {
            success: false,
            uid: uid,
            error: error.message,
          },
        });
      }
    }

    return [returnData];
  }
}

module.exports = { FirebaseDeleteUser };