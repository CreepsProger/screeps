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
		 , { from: '5f113f8fb8bd4609cef0cf6d', to: '5f367cadeb9719134d9389e4'}
		 , { from: '5f5178103505a018d6b53baa', to: '5f1139b60fa8678edc0322df'}
		 , { from: '5f5178103505a018d6b53baa', to: '5f367cadeb9719134d9389e4'}
		 , { from: '5f51be7738c272c9878cc665', to: '5f1139b60fa8678edc0322df'}
		 , { from: '5f51be7738c272c9878cc665', to: '5f367cadeb9719134d9389e4'}
		 , { from: '5f17a8cf984d10bb63890aed', to: '5f1139b60fa8678edc0322df'}
		 , { from: '5f17a8cf984d10bb63890aed', to: '5f367cadeb9719134d9389e4'}
		 // W57S51
		 , { from: '5eca412f8c3107ebdeefb9e6', to: '5eca180c92ba7d5000134e55'}
		 , { from: '5ed3cf115a106b588e6897f0', to: '5eca180c92ba7d5000134e55'}
		 , { from: '5f1a20ad24c1702c276faf57', to: '5eca180c92ba7d5000134e55'}
		 , { from: '5f21dd25f1e82d763b0c9c1e', to: '5eca180c92ba7d5000134e55'}
		 , { from: '5f21dd25f1e82d763b0c9c1e', to: '5ee200d10c93a776abd075c5'}
		 , { from: '5f1a20ad24c1702c276faf57', to: '5ee200d10c93a776abd075c5'}
		 , { from: '5eca412f8c3107ebdeefb9e6', to: '5ee200d10c93a776abd075c5'}
		 , { from: '5ed3cf115a106b588e6897f0', to: '5ee200d10c93a776abd075c5'}
		 // W57S52
		 , { from: '5eb25ddfc795bed55b8fa8c1', to: '5eb6bb124d1a58817da74682'}
		 , { from: '5ebabdae8cc74a8929449507', to: '5eb6bb124d1a58817da74682'}
		 , { from: '5f3337f921769e109fe0134a', to: '5eb6bb124d1a58817da74682'}
		 , { from: '5f33404d58712192a9f244cc', to: '5eb6bb124d1a58817da74682'}
		 , { from: '5f33404d58712192a9f244cc', to: '5ecdfa2cca39541e2301a405'}
		 , { from: '5f3337f921769e109fe0134a', to: '5ecdfa2cca39541e2301a405'}
		 , { from: '5ebabdae8cc74a8929449507', to: '5ecdfa2cca39541e2301a405'}
		 , { from: '5eb25ddfc795bed55b8fa8c1', to: '5ecdfa2cca39541e2301a405'}
		 // W56S52
		 , { from: '5f5aec811b2ca675a0efc3fe', to: '5f6c2ff4e86859a05259bc4b'}
		 , { from: '5f5ed4b6d75fca0a459bbc74', to: '5f6c2ff4e86859a05259bc4b'}
		 // W56S53
		 , { from: '5f6e8e5ee7020d7a8dde97e6', to: '5f6a682221c5360746c0e954'}
		 , { from: '5f6d3aeab0011940ed7b2905', to: '5f6a682221c5360746c0e954'}
		 , { from: '5f83286a9d3bf06ab29b969b', to: '5f6a682221c5360746c0e954'}
		 , { from: '5fa3e744b58950400fec2273', to: '5f6a682221c5360746c0e954'}
		 , { from: '5f6e8e5ee7020d7a8dde97e6', to: '5f734c376c236600d938bc4c'}
		 , { from: '5f6d3aeab0011940ed7b2905', to: '5f734c376c236600d938bc4c'}
		 , { from: '5f83286a9d3bf06ab29b969b', to: '5f734c376c236600d938bc4c'}
		 , { from: '5fa3e744b58950400fec2273', to: '5f734c376c236600d938bc4c'}
		 // W54S53
		 , { from: '5f8510578eb937f14fc91101', to: '5f850c61de14c3175ea48e1d'}
		 , { from: '5f87c9b2ab8aedb1d194c7c4', to: '5f850c61de14c3175ea48e1d'}
		 , { from: '5f9631256d8e9a3731ba2022', to: '5f850c61de14c3175ea48e1d'}
		 , { from: '5fa2b7935cc5964cf571b701', to: '5f850c61de14c3175ea48e1d'}
		 , { from: '5f8510578eb937f14fc91101', to: '5fa17ba9acd2541375121d41'}
		 , { from: '5f87c9b2ab8aedb1d194c7c4', to: '5fa17ba9acd2541375121d41'}
		 , { from: '5f9631256d8e9a3731ba2022', to: '5fa17ba9acd2541375121d41'}
		 , { from: '5fa2b7935cc5964cf571b701', to: '5fa17ba9acd2541375121d41'}
		 // W55S53
		 , { from: '5f9b05ed897cb5597c0acbeb', to: '5f9aae53c238df790bd0e10e'}
		 , { from: '5f9d6bcef370105e5bc10418', to: '5f9aae53c238df790bd0e10e'}
		 , { from: '60577eb1208207a0af035f5f', to: '5f9aae53c238df790bd0e10e'}
		 , { from: '60577df8cbcd8d3483eb345b', to: '5f9aae53c238df790bd0e10e'}
		 , { from: '5f9b05ed897cb5597c0acbeb', to: '5fa169869f1fa40b9ee0d07c'}
		 , { from: '5f9d6bcef370105e5bc10418', to: '5fa169869f1fa40b9ee0d07c'}
		 , { from: '60577eb1208207a0af035f5f', to: '5fa169869f1fa40b9ee0d07c'}
		 , { from: '60577df8cbcd8d3483eb345b', to: '5fa169869f1fa40b9ee0d07c'}
		 // W58S54
		 , { from: '605aa712ca16000db03cd120', to: '605ab55c98e670e45cdb62e6'}
		 , { from: '605e00eba7699c0a6609ad6f', to: '605ab55c98e670e45cdb62e6'}
		 , { from: '6066dae0dd93324c4f07f742', to: '605ab55c98e670e45cdb62e6'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 // W57S55
		 , { from: '605de22cfac58c035bd6bbef', to: '605de61e985bf911c9555c72'}
		 , { from: '60601b8507732f3d96e827b6', to: '605de61e985bf911c9555c72'}
		 , { from: '605de22cfac58c035bd6bbef', to: '606610369118fc6dd0f053d4'}
		 , { from: '60601b8507732f3d96e827b6', to: '606610369118fc6dd0f053d4'}
		 // W57S56
		 , { from: '60649984bdf9e1aa7c1c715e', to: '6064cbe20e1ec265977c7945'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 // W52S54
		 , { from: '60656d17394e164e8d65034f', to: '60656a16efd8745d87108cf2'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
     //shard1
		 // W21S23
		 , { from: '6061f22a51e6a6c279b13ca3', to: '6061dc24f65aff38d39a2f2a'}
		 , { from: '6064ac3c5ef9140dd1186216', to: '6061dc24f65aff38d39a2f2a'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
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
     , { from: '5f2a5ea447f60c98f6ce341b', to: '5ec8daa98ef2be519dc71a15'}
		 , { from: '5f2a5af80f0a8b02130a866d', to: '5ee4ea3abeab12e9af315313'}
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
		 , { from: '5f3091ecff5a0f13f7dadb77', to: '5ee0549e589152454a7a9c3e'}
		 , { from: '5f308e1813620d4595d1b0dd', to: '5ee0549e589152454a7a9c3e'}
		 , { from: '5f3091ecff5a0f13f7dadb77', to: '5eed7d4a8aee4918f1ab6979'}
		 , { from: '5f308e1813620d4595d1b0dd', to: '5eed7d4a8aee4918f1ab6979'}
		 , { from: '5ee517b1ad607b802eafe899', to: '5eed7d4a8aee4918f1ab6979'}
		 , { from: '5ee517ce769d8d1842d9b497', to: '5eed7d4a8aee4918f1ab6979'}
		 // W24S28
     , { from: '5eef5447fd430241d57051db', to: '5eef4e0b11de28d372e7cca2'}
		 , { from: '5ef1a32ab79b686b7968a661', to: '5eef4e0b11de28d372e7cca2'}
		 , { from: '5ef8085cf449b131881445a5', to: '5eef4e0b11de28d372e7cca2'}
		 , { from: '5f20e770608ca8dd40be7539', to: '5eef4e0b11de28d372e7cca2'}
     , { from: '5f20e770608ca8dd40be7539', to: '5f20d6e52633680663b1e05f'}
     , { from: '5eef5447fd430241d57051db', to: '5f20d6e52633680663b1e05f'}
		 , { from: '5ef1a32ab79b686b7968a661', to: '5f20d6e52633680663b1e05f'}
		 , { from: '5ef8085cf449b131881445a5', to: '5f20d6e52633680663b1e05f'}
		 // W21S28
     , { from: '5f06dc8407c460ca3d230a0a', to: '5f048e5511093c2c6f7062bc'}
		 , { from: '5f06f2f3ae021357155fe904', to: '5f048e5511093c2c6f7062bc'}
		 , { from: '5f44abb83cb23d57aa8587f5', to: '5f048e5511093c2c6f7062bc'}
		 , { from: '5f44b6a193778e0ef8dfcf22', to: '5f048e5511093c2c6f7062bc'}
     , { from: '5f06dc8407c460ca3d230a0a', to: '5f1cfbc3a923e96f80b70649'}
		 , { from: '5f06f2f3ae021357155fe904', to: '5f1cfbc3a923e96f80b70649'}
		 , { from: '5f44abb83cb23d57aa8587f5', to: '5f1cfbc3a923e96f80b70649'}
		 , { from: '5f44b6a193778e0ef8dfcf22', to: '5f1cfbc3a923e96f80b70649'}
		 // W24S27
     , { from: '5f1fc39c22555750702c437e', to: '5f1ed9627b54544b5b0a74c4'}
     , { from: '5f244f0aaceb5f70ace9b80f', to: '5f2eca4411318ee2e59f5f45'}
     , { from: '5f416c353cb23d54c283dd2d', to: '5f2eca4411318ee2e59f5f45'}
     , { from: '5f415ca092167c8cc9f67dbb', to: '5f2eca4411318ee2e59f5f45'}
     , { from: '5f415ca092167c8cc9f67dbb', to: '5f1ed9627b54544b5b0a74c4'}
     , { from: '5f416c353cb23d54c283dd2d', to: '5f1ed9627b54544b5b0a74c4'}
     , { from: '5f244f0aaceb5f70ace9b80f', to: '5f1ed9627b54544b5b0a74c4'}
     , { from: '5f1fc39c22555750702c437e', to: '5f1ed9627b54544b5b0a74c4'}
		 // W25S28
     , { from: '5f3a2c42ef07735899b6db6c', to: '5f3a2ad8218ec55b8abed857'}
     , { from: '5f3e166c6013057f01447c62', to: '5f3a2ad8218ec55b8abed857'}
     , { from: '5f56d0b15754b77e8cd41cec', to: '5f3a2ad8218ec55b8abed857'}
     , { from: '5f3a2c42ef07735899b6db6c', to: '5f452acdd9371e83f12d4c46'}
     , { from: '5f3e166c6013057f01447c62', to: '5f452acdd9371e83f12d4c46'}
     , { from: '5f56d0b15754b77e8cd41cec', to: '5f452acdd9371e83f12d4c46'}
		 // W29S27
     , { from: '5f56cf1948a48dcae11be8ef', to: '5f56cc49fbfd1ed45772dd95'}
     , { from: '5f60e22052c3b6df4a25723b', to: '5f56cc49fbfd1ed45772dd95'}
     , { from: '5f56cf1948a48dcae11be8ef', to: '5f68573e20b839cf6c7fca60'}
     , { from: '5f60e22052c3b6df4a25723b', to: '5f68573e20b839cf6c7fca60'}
		 // W25S27
     , { from: '5f69661ba8e4d9d210b046d4', to: '5f69bb2f48c0c68423db476e'}
     , { from: '5f73cdf3f5a3c9b77c1a8834', to: '5f69bb2f48c0c68423db476e'}
     , { from: '5f810d5b0a30a0031d100818', to: '5f69bb2f48c0c68423db476e'}
     , { from: '5f821846811df89e13562875', to: '5f69bb2f48c0c68423db476e'}
     , { from: '5f69661ba8e4d9d210b046d4', to: '5f7347eff5a3c9eb4e1a470d'}
     , { from: '5f73cdf3f5a3c9b77c1a8834', to: '5f7347eff5a3c9eb4e1a470d'}
     , { from: '5f810d5b0a30a0031d100818', to: '5f7347eff5a3c9eb4e1a470d'}
     , { from: '5f821846811df89e13562875', to: '5f7347eff5a3c9eb4e1a470d'}
		 // W26S27
     , { from: '5f75167b859ec9e2a2015472', to: '5f7512e2dda985231272f4d9'}
     , { from: '5f78ac865f7bb6e178155eea', to: '5f7512e2dda985231272f4d9'}
     , { from: '5f836592b0bd571b3f7f31ed', to: '5f7512e2dda985231272f4d9'}
     , { from: '5f96e2c0993ac831c01dcda4', to: '5f7512e2dda985231272f4d9'}
     , { from: '5f75167b859ec9e2a2015472', to: '5f944bde60565492098a58fa'}
     , { from: '5f78ac865f7bb6e178155eea', to: '5f944bde60565492098a58fa'}
     , { from: '5f836592b0bd571b3f7f31ed', to: '5f944bde60565492098a58fa'}
     , { from: '5f96e2c0993ac831c01dcda4', to: '5f944bde60565492098a58fa'}
		 // W27S26
     , { from: '5fa30331b9fcc1a0e2f5d07f', to: '5f871d80e7baea1682e0310e'}
     , { from: '5f871fad07d37c30109cba17', to: '5f871d80e7baea1682e0310e'}
     , { from: '5f8ab7b41b813667cd0c18bd', to: '5f871d80e7baea1682e0310e'}
     , { from: '5fa3b008847dbc692b2cbe53', to: '5f871d80e7baea1682e0310e'}
     , { from: '5fa30331b9fcc1a0e2f5d07f', to: '5fa3a7f1c63f0f33786ce1ef'}
     , { from: '5f871fad07d37c30109cba17', to: '5fa3a7f1c63f0f33786ce1ef'}
     , { from: '5f8ab7b41b813667cd0c18bd', to: '5fa3a7f1c63f0f33786ce1ef'}
     , { from: '5fa3b008847dbc692b2cbe53', to: '5fa3a7f1c63f0f33786ce1ef'}
		 // W27S25
     , { from: '5f9f955b68da5212e38c186a', to: '5f9f752c1d0e8d18ee6b82ff'}
     , { from: '60575f57a591d08cd4c75890', to: '5f9f752c1d0e8d18ee6b82ff'} 
     , { from: '6062d142f51ff4a480ac21d0', to: '5f9f752c1d0e8d18ee6b82ff'} 
     , { from: '6062cc9517188454958e72f0', to: '5f9f752c1d0e8d18ee6b82ff'} 
     , { from: '5f9f955b68da5212e38c186a', to: '5faaaedb2139da4efe80bf11'} 
     , { from: '60575f57a591d08cd4c75890', to: '5faaaedb2139da4efe80bf11'} 
     , { from: '6062d142f51ff4a480ac21d0', to: '5faaaedb2139da4efe80bf11'} 
     , { from: '6062cc9517188454958e72f0', to: '5faaaedb2139da4efe80bf11'}
		 // W27S24
     , { from: '5fae75938dc19a1a87c4240c', to: '5fafed3be00561eaab9b9f3c'}
     , { from: '5fae75938dc19a1a87c4240c', to: '60562f4d539848db0c959628'}
     , { from: '605652348f2bec493f520987', to: '5fafed3be00561eaab9b9f3c'}
     , { from: '605652348f2bec493f520987', to: '60562f4d539848db0c959628'}
     , { from: '6056581e78b15e3dc79cf7ee', to: '5fafed3be00561eaab9b9f3c'}
     , { from: '6056581e78b15e3dc79cf7ee', to: '60562f4d539848db0c959628'}
     , { from: '605657eb8ef3accea1e7cd76', to: '5fafed3be00561eaab9b9f3c'}
     , { from: '605657eb8ef3accea1e7cd76', to: '60562f4d539848db0c959628'}
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
					 target = (!executer)? link:tools.setTarget(creep,link,link.id,role_run);
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
