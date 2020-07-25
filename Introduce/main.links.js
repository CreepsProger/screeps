const constants = require('main.constants');
const tools = require('tools');
const cash = require('cash');

var links = {

   links: [
		   { from: '5ea6d04fc5c2a5244a596e7f', to: '5e84c3a416b8c6668c29708e'}
		 , { from: '5e5f8ed0124b9b1087db5d47', to: '5e84c3a416b8c6668c29708e'}
		 , { from: '5e985ee1e6906313d1940db1', to: '5e84c3a416b8c6668c29708e'}
		 , { from: '5eb204d7b82d51137751bc96', to: '5e84c3a416b8c6668c29708e'}
		 , { from: '5ea6d04fc5c2a5244a596e7f', to: '5eb13e57b82d5125605177d9'}
		 , { from: '5e5f8ed0124b9b1087db5d47', to: '5eb13e57b82d5125605177d9'}
		 , { from: '5e985ee1e6906313d1940db1', to: '5eb13e57b82d5125605177d9'}
		 , { from: '5eb204d7b82d51137751bc96', to: '5eb13e57b82d5125605177d9'}
		 , { from: '5e70e2cac19c1cd2f3542b55', to: '5e7dc9b130d83f0ebc107bf0'}
		 , { from: '5e7dd868b4377d741d9d7465', to: '5e7dc9b130d83f0ebc107bf0'}
		 , { from: '5ec581c69c43ed5323c83b91', to: '5e7dc9b130d83f0ebc107bf0'}
		 , { from: '5ec7e751dc24d568847afe34', to: '5e7dc9b130d83f0ebc107bf0'}
		 , { from: '5ec7e751dc24d568847afe34', to: '5ec53bba22f7dfb9523ee365'}
		 , { from: '5e70e2cac19c1cd2f3542b55', to: '5ec53bba22f7dfb9523ee365'}
		 , { from: '5e7dd868b4377d741d9d7465', to: '5ec53bba22f7dfb9523ee365'}
		 , { from: '5ec581c69c43ed5323c83b91', to: '5ec53bba22f7dfb9523ee365'}
		 //shard3
		 // W27S34
		 , { from: '5edf420a6dec0d838308c7bd', to: '5edf42a953cb0e5bc901492c'}
		 , { from: '5ee458245db87b5b4dbabe4e', to: '5edf42a953cb0e5bc901492c'}
		 , { from: '5edf420a6dec0d838308c7bd', to: '5eeaf4d273d53001ea317dae'}
		 , { from: '5ee458245db87b5b4dbabe4e', to: '5eeaf4d273d53001ea317dae'}
		 , { from: '5eff032796ad284938095fc4', to: '5edf42a953cb0e5bc901492c'}
		 , { from: '5eff013f3ec9f5aa91d318bc', to: '5edf42a953cb0e5bc901492c'}
		 , { from: '5eff032796ad284938095fc4', to: '5eeaf4d273d53001ea317dae'}
		 , { from: '5eff013f3ec9f5aa91d318bc', to: '5eeaf4d273d53001ea317dae'}
		 // W26S33
		 , { from: '5e61d337f15a48007bf5b603', to: '5e8b58f3932a5a2a414fe7d5'}
		 , { from: '5e6778dfcfa64f5485786f84', to: '5e8b58f3932a5a2a414fe7d5'}
		 , { from: '5edc83cadad212d9040c80c4', to: '5e8b58f3932a5a2a414fe7d5'}
		 , { from: '5eda0e80b44c3e2348c66db0', to: '5e8b58f3932a5a2a414fe7d5'}
		 , { from: '5eda0e80b44c3e2348c66db0', to: '5e5ab4f1142d6b46f3c86280'}
		 , { from: '5edc83cadad212d9040c80c4', to: '5e5ab4f1142d6b46f3c86280'}
		 , { from: '5e61d337f15a48007bf5b603', to: '5e5ab4f1142d6b46f3c86280'}
		 , { from: '5e6778dfcfa64f5485786f84', to: '5e5ab4f1142d6b46f3c86280'}
		 // W28S35
		 , { from: '5e8c2759c2f2cccfed24f937', to: '5e8c18b345cd496629f60413'}
		 , { from: '5e907d35346c517957d236f0', to: '5e8c18b345cd496629f60413'}
		 , { from: '5ed15e21a6e675dd396ef3fb', to: '5e8c18b345cd496629f60413'}
		 , { from: '5ed1b72606548f56f5085822', to: '5e8c18b345cd496629f60413'}
		 , { from: '5ed1b72606548f56f5085822', to: '5e97e3b51ddfadb9843d28cc'}
		 , { from: '5ed15e21a6e675dd396ef3fb', to: '5e97e3b51ddfadb9843d28cc'}
		 , { from: '5e8c2759c2f2cccfed24f937', to: '5e97e3b51ddfadb9843d28cc'}
		 , { from: '5e907d35346c517957d236f0', to: '5e97e3b51ddfadb9843d28cc'}
		 // W29S32
		 , { from: '5ea806187e4c0781d6d8c6c3', to: '5ead90415ed8e6655882a2c3'}
		 , { from: '5e9b91270a28a6137925c1e9', to: '5ead90415ed8e6655882a2c3'}
		 , { from: '5ece9bffe2933a85f35ecb44', to: '5ead90415ed8e6655882a2c3'}
		 , { from: '5ece924fe78f994c37e42f19', to: '5ead90415ed8e6655882a2c3'}
		 , { from: '5ece924fe78f994c37e42f19', to: '5ead142d34cf58108260b4fc'}
		 , { from: '5ece9bffe2933a85f35ecb44', to: '5ead142d34cf58108260b4fc'}
		 , { from: '5ea806187e4c0781d6d8c6c3', to: '5ead142d34cf58108260b4fc'}
		 , { from: '5e9b91270a28a6137925c1e9', to: '5ead142d34cf58108260b4fc'}
		 //shard0
		 // W54S51
		 , { from: '5f113f8fb8bd4609cef0cf6d', to: '5f1139b60fa8678edc0322df'}
		 , { from: '5f17a8cf984d10bb63890aed', to: '5f1139b60fa8678edc0322df'}
		 // W57S51
		 , { from: '5eca412f8c3107ebdeefb9e6', to: '5eca180c92ba7d5000134e55'}
		 , { from: '5ed3cf115a106b588e6897f0', to: '5eca180c92ba7d5000134e55'}
		 , { from: '5f1a20ad24c1702c276faf57', to: '5eca180c92ba7d5000134e55'}
		 , { from: '5f1a20ad24c1702c276faf57', to: '5ee200d10c93a776abd075c5'}
		 , { from: '5eca412f8c3107ebdeefb9e6', to: '5ee200d10c93a776abd075c5'}
		 , { from: '5ed3cf115a106b588e6897f0', to: '5ee200d10c93a776abd075c5'}
		 // W57S52
		 , { from: '5eb25ddfc795bed55b8fa8c1', to: '5eb6bb124d1a58817da74682'}
		 , { from: '5ebabdae8cc74a8929449507', to: '5eb6bb124d1a58817da74682'}
		 , { from: '5ebabdae8cc74a8929449507', to: '5ecdfa2cca39541e2301a405'}
		 , { from: '5eb25ddfc795bed55b8fa8c1', to: '5ecdfa2cca39541e2301a405'}
     //shard1
		 // W29S29
		 , { from: '5ec2330dce2f77348cbbc2ae', to: '5ec1fb20a882200050a21624'}
		 , { from: '5ec7eef883db9c68a817960e', to: '5ec1fb20a882200050a21624'}
		 , { from: '5ed7b1004ac3afa92b4f7ab5', to: '5ec1fb20a882200050a21624'}
		 , { from: '5f1a87f5cf16123a66582ae0', to: '5ec1fb20a882200050a21624'}
		 , { from: '5f1b1a27a6832536693fffd6', to: '5ec1fb20a882200050a21624'}
		 , { from: '5f1b1a27a6832536693fffd6', to: '5f1ab0bc3c2aaf1f5bb267f4'}
		 , { from: '5f1a87f5cf16123a66582ae0', to: '5f1ab0bc3c2aaf1f5bb267f4'}
		 , { from: '5ec2330dce2f77348cbbc2ae', to: '5f1ab0bc3c2aaf1f5bb267f4'}
		 , { from: '5ec7eef883db9c68a817960e', to: '5f1ab0bc3c2aaf1f5bb267f4'}
		 , { from: '5ed7b1004ac3afa92b4f7ab5', to: '5f1ab0bc3c2aaf1f5bb267f4'}
     // W28S29
     , { from: '5ec8e23e1d709fc4992a1bc9', to: '5ec8daa98ef2be519dc71a15'}
     , { from: '5ece83d23359265d2b9f12e1', to: '5ec8daa98ef2be519dc71a15'}
		 , { from: '5ec8e23e1d709fc4992a1bc9', to: '5ee4ea3abeab12e9af315313'}
     , { from: '5ece83d23359265d2b9f12e1', to: '5ee4ea3abeab12e9af315313'}
		 // W27S29
     , { from: '5ed3460fdd460cf81538fd95', to: '5ed2ff7c0eb18a4626c06c30'}
		 , { from: '5ed7071dfd8bf91a28413b8d', to: '5ed2ff7c0eb18a4626c06c30'}
		 , { from: '5f1899d954ef6e5f472edc23', to: '5ee1a3681dc9510405865302'}
		 , { from: '5f18989e500186f126b3910c', to: '5ee1a3681dc9510405865302'}
		 , { from: '5f18989e500186f126b3910c', to: '5ed2ff7c0eb18a4626c06c30'}
		 , { from: '5f1899d954ef6e5f472edc23', to: '5ed2ff7c0eb18a4626c06c30'}
		 , { from: '5ed3460fdd460cf81538fd95', to: '5ee1a3681dc9510405865302'}
		 , { from: '5ed7071dfd8bf91a28413b8d', to: '5ee1a3681dc9510405865302'}
		 // W29S31
     , { from: '5ee517b1ad607b802eafe899', to: '5ee0549e589152454a7a9c3e'}
		 , { from: '5ee517ce769d8d1842d9b497', to: '5ee0549e589152454a7a9c3e'}
		 , { from: '5ee517b1ad607b802eafe899', to: '5eed7d4a8aee4918f1ab6979'}
		 , { from: '5ee517ce769d8d1842d9b497', to: '5eed7d4a8aee4918f1ab6979'}
		 // W24S28
     , { from: '5eef5447fd430241d57051db', to: '5eef4e0b11de28d372e7cca2'}
		 , { from: '5ef1a32ab79b686b7968a661', to: '5eef4e0b11de28d372e7cca2'}
		 , { from: '5ef8085cf449b131881445a5', to: '5eef4e0b11de28d372e7cca2'}
		 // W21S28
     , { from: '5f06dc8407c460ca3d230a0a', to: '5f048e5511093c2c6f7062bc'}
		 , { from: '5f06f2f3ae021357155fe904', to: '5f048e5511093c2c6f7062bc'}
	 ],

	 getTargetLinkToTransferEnergy: function(creep, executer, role_run, link_weight) {
		 var target;
		 if(link_weight < tools.getWeight(creep.name)) {
			 var link_objs = cash.getLinks(creep.room).filter( (link) => {
					 return !!link && link.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
						 			creep.pos.inRangeTo(link, 7) &&
									!!links.links.find((ft) => ft.from == link.id) &&
						 			tools.checkTarget(executer,link.id);
				 }
			 );

			 if(link_objs.length > 0) {
				 var link = link_objs.reduce((p,c) => tools.checkTarget(executer,p.id) &&
				 creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
				 if(!!link) {
					 target = tools.setTarget(creep,link,link.id,role_run);
				 }
			 }
		 }

		 return target;
	 },

	 getTargetLinkToHarvest: function(creep, executer) {
		 var link;
		 var link_objs = cash.getLinks(creep.room).filter( (l) => {
				 return !!l && l.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
				 				!!links.links.find((ft) => ft.to == l.id) &&
				 				tools.checkTarget(executer,l.id);
		   }
		 );
		 if(link_objs.length > 0) {
			 link = link_objs.reduce((p,c) => creep.pos.getRangeTo(p) < creep.pos.getRangeTo(c)? p:c);
		 }
		 return link;
	 },

   run: function() {
		 links.links.forEach(function(link) {
			 const from = Game.getObjectById(link.from);
			 const to = Game.getObjectById(link.to);
			 if(!!from && !!to &&
				  !!from.store && from.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
					!!to.store && to.store.getFreeCapacity(RESOURCE_ENERGY) > 100) {
				 from.transferEnergy(to);
			 }
		 });
	 }
};

module.exports = links;
