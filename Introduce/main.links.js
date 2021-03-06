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
		 // W31S28
		 , { from: '6099588f46bc5c48dfc26207', to: '60995512e0fde357a4889f1a'}
		 , { from: '6099588f46bc5c48dfc26207', to: '609dc9d860f5d7150c9422db'}
		 , { from: '60a1503bf2a3dc62978512cc', to: '60995512e0fde357a4889f1a'}
		 , { from: '60a1503bf2a3dc62978512cc', to: '609dc9d860f5d7150c9422db'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 //shard0
		 // W51S57
		 , { from: '60e5917ad37db8ae5d3d3342', to: '60e58eb58a05dcc36e0d6588'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 // W53S56
		 , { from: '60cb4b133f171f35eb0484f6', to: '60cc0e00b8f6ac2d5bda71b1'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 // W57S59
		 , { from: '60ce858e2cd09948f00f799b', to: '60cf4fde6dc6923b1a3e1663'}
		 , { from: '60ce858e2cd09948f00f799b', to: '60e598b7c83096cbf7e44ddb'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 // W53S53
		 , { from: '60c8589166a27593083b84bd', to: '60c8119b84663822a8ff0a7c'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 // W52S56
		 , { from: '60ba24a26d5bb2f71ac6df58', to: '60ba1bcc3bba2ae1661b3251'}
		 , { from: '60ba24a26d5bb2f71ac6df58', to: '60bbc4f300143e81d9c0c3df'}
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
		 , { from: '608d35f214ed2160411e75c6', to: '605ab55c98e670e45cdb62e6'}
		 , { from: '605aa712ca16000db03cd120', to: '608bb6da5a6bdd0937fee79a'}
		 , { from: '605e00eba7699c0a6609ad6f', to: '608bb6da5a6bdd0937fee79a'}
		 , { from: '6066dae0dd93324c4f07f742', to: '608bb6da5a6bdd0937fee79a'}
		 , { from: '608d35f214ed2160411e75c6', to: '608bb6da5a6bdd0937fee79a'}
		 // W57S55
		 , { from: '605de22cfac58c035bd6bbef', to: '605de61e985bf911c9555c72'}
		 , { from: '605de22cfac58c035bd6bbef', to: '606610369118fc6dd0f053d4'}
		 , { from: '60601b8507732f3d96e827b6', to: '606610369118fc6dd0f053d4'}
		 , { from: '60601b8507732f3d96e827b6', to: '605de61e985bf911c9555c72'}
		 , { from: '60911a7ad112d9c92a1fc03c', to: '606610369118fc6dd0f053d4'}
		 , { from: '60913de9c6a77874dafdecec', to: '605de61e985bf911c9555c72'}
		 , { from: '60913de9c6a77874dafdecec', to: '606610369118fc6dd0f053d4'}
		 , { from: '60911a7ad112d9c92a1fc03c', to: '605de61e985bf911c9555c72'}
		 // W57S56
		 , { from: '60649984bdf9e1aa7c1c715e', to: '6064cbe20e1ec265977c7945'}
		 , { from: '606c5f01e970ce547bde8f77', to: '6064cbe20e1ec265977c7945'}
		 , { from: '609d60fd7491c1724b14847b', to: '6064cbe20e1ec265977c7945'}
		 , { from: '609eb2cd14ed2111a6265263', to: '6064cbe20e1ec265977c7945'}
		 , { from: '60781ee8ac5c1d5bf8b33be1', to: '6064cbe20e1ec265977c7945'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 // W52S54
		 , { from: '60656d17394e164e8d65034f', to: '60656a16efd8745d87108cf2'}
		 , { from: '606845632a2993e2e6e7089a', to: '60656a16efd8745d87108cf2'}
		 , { from: '6073b885eb3a32cc8406b0aa', to: '60656a16efd8745d87108cf2'}
		 , { from: '6096bc0bc76f7d5810491b92', to: '60656a16efd8745d87108cf2'}
		 , { from: '60656d17394e164e8d65034f', to: '6095218cb4f2ac1ef19a0615'}
		 , { from: '606845632a2993e2e6e7089a', to: '6095218cb4f2ac1ef19a0615'}
		 , { from: '6073b885eb3a32cc8406b0aa', to: '6095218cb4f2ac1ef19a0615'}
		 , { from: '6096bc0bc76f7d5810491b92', to: '6095218cb4f2ac1ef19a0615'}
		 // W54S57
		 , { from: '606823b8dd93327f2408915c', to: '6067de588c32091c95fdd798'}
		 , { from: '606e6efb3b6b3f035a63453e', to: '607921746b401849682f711a'}
		 , { from: '606823b8dd93327f2408915c', to: '607921746b401849682f711a'}
		 , { from: '606e6efb3b6b3f035a63453e', to: '6067de588c32091c95fdd798'}
		 , { from: '609288c75704b43a63a61659', to: '607921746b401849682f711a'}
		 , { from: '60bed2c66d5bb230a0c8cda4', to: '6067de588c32091c95fdd798'}
		 , { from: '609288c75704b43a63a61659', to: '6067de588c32091c95fdd798'}
		 , { from: '60bed2c66d5bb230a0c8cda4', to: '607921746b401849682f711a'}
		 // W59S51
		 , { from: '6088a820e2f47805f35e3b8b', to: '60887cfbdbfd121d0b725d00'}
		 , { from: '6088a820e2f47805f35e3b8b', to: '60887cfbdbfd121d0b725d00'}
		 , { from: '608d141a2f78991070ebd3c4', to: '60887cfbdbfd121d0b725d00'}
		 , { from: '608d141a2f78991070ebd3c4', to: '60887cfbdbfd121d0b725d00'}
     //shard2
		 // W31S29
		 , { from: '6075427b5c14295f6dfa87b8', to: '60752abed90f9e58c2383e9d'}
		 , { from: '6075352f234567e1c96e85b7', to: '60752abed90f9e58c2383e9d'}
		 , { from: '6075427b5c14295f6dfa87b8', to: '6078ceeec30a9f3e05aee3c4'}
		 , { from: '6075352f234567e1c96e85b7', to: '6078ceeec30a9f3e05aee3c4'}
     //shard1
		 // W26S28
		 , { from: '60d95878ff956951488e3987', to: '60e02b741127c55bece34d30'}
		 , { from: '60d95878ff956951488e3987', to: '60e05b8d5b89461adf7abcba'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 // W24S21
		 , { from: '60bcb94f0981d91d961eab14', to: '60bcb6d4e15a1d269f17dbdd'}
		 , { from: '60befb0d653daca5675151ac', to: '60bcb6d4e15a1d269f17dbdd'}
		 , { from: '60bcb94f0981d91d961eab14', to: '60dabb284d432b6d552264f9'}
		 , { from: '60befb0d653daca5675151ac', to: '60dabb284d432b6d552264f9'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 // W23S21
		 , { from: '60b7b2192f1a91ac0743a866', to: '60b7aeb97890494606dcf514'}
		 , { from: '60bca7475b8946e41c6aedcd', to: '60b7aeb97890494606dcf514'}
		 , { from: '60e220099b45a70d30c9edc7', to: '60b7aeb97890494606dcf514'}
		 , { from: '60b7b2192f1a91ac0743a866', to: '60c7769f7c7fd08a4180e66c'}
		 , { from: '60bca7475b8946e41c6aedcd', to: '60c7769f7c7fd08a4180e66c'}
		 , { from: '60e220099b45a70d30c9edc7', to: '60c7769f7c7fd08a4180e66c'}
		 , { from: 'aaaaaaaaaaaaaaaaaaaaaaaa', to: 'bbbbbbbbbbbbbbbbbbbbbbbb'}
		 // W22S21
		 , { from: '60b3608f7f382d866bf5dcf5', to: '60b35de3364c59a062a21225',      harvest_from_to_if_full: ['60d71557d968045b4476480d','60d7cc3d47c8aa4bbfd1328f']}
		 , { from: '60bd21ef2856e64b2995111b', to: '60b35de3364c59a062a21225',      harvest_from_to_if_full: ['60d71557d968045b4476480d','60d7cc3d47c8aa4bbfd1328f']}
		 , { from: '60b3608f7f382d866bf5dcf5', to: '60c1074a18e265696de0ca25',      harvest_from_to_if_full: ['60d71557d968045b4476480d','60d7cc3d47c8aa4bbfd1328f']}
		 , { from: '60bd21ef2856e64b2995111b', to: '60c1074a18e265696de0ca25',      harvest_from_to_if_full: ['60d71557d968045b4476480d','60d7cc3d47c8aa4bbfd1328f']}
		 , { from: '60b35de3364c59a062a21225', end: '60d7cc3d47c8aa4bbfd1328f', no_transfer_to_from_if_full: ['60d71557d968045b4476480d','60d7cc3d47c8aa4bbfd1328f']}
		 , { from: '60c1074a18e265696de0ca25', end: '60d7cc3d47c8aa4bbfd1328f', no_transfer_to_from_if_full: ['60d71557d968045b4476480d','60d7cc3d47c8aa4bbfd1328f']}
		 , { from: '60b35de3364c59a062a21225', end: '60d71557d968045b4476480d', no_transfer_to_from_if_full: ['60d71557d968045b4476480d','60d7cc3d47c8aa4bbfd1328f']}
		 , { from: '60c1074a18e265696de0ca25', end: '60d71557d968045b4476480d', no_transfer_to_from_if_full: ['60d71557d968045b4476480d','60d7cc3d47c8aa4bbfd1328f']}
		 // W21S29
		 // can't harvest from 'to' if 'noto_ifnotfull' is not full
		 // can't trasfer to 'from' if 'from_full' is full
		 , { from: '606c0103e4f71a7dc14b0add', to: '606bf19c11a48494f0af712b',      harvest_from_to_if_full: ['6083dd420436cceb117bbe87','60b23fe3ca812e40e9afd876']}
		 , { from: '606c0103e4f71a7dc14b0add', to: '60740882c2b047ea7ba4f7e7',      harvest_from_to_if_full: ['6083dd420436cceb117bbe87','60b23fe3ca812e40e9afd876']}
		 , { from: '6082fe479bf8df15ef3d6c33', to: '60740882c2b047ea7ba4f7e7',      harvest_from_to_if_full: ['6083dd420436cceb117bbe87','60b23fe3ca812e40e9afd876']}
		 , { from: '6082fe479bf8df15ef3d6c33', to: '606bf19c11a48494f0af712b',      harvest_from_to_if_full: ['6083dd420436cceb117bbe87','60b23fe3ca812e40e9afd876']}
		 , { from: '606bf19c11a48494f0af712b', end: '6083dd420436cceb117bbe87', no_transfer_to_from_if_full: ['6083dd420436cceb117bbe87','60b23fe3ca812e40e9afd876']}
		 , { from: '60740882c2b047ea7ba4f7e7', end: '60b23fe3ca812e40e9afd876', no_transfer_to_from_if_full: ['6083dd420436cceb117bbe87','60b23fe3ca812e40e9afd876']}
		 , { from: '606bf19c11a48494f0af712b', end: '60b23fe3ca812e40e9afd876', no_transfer_to_from_if_full: ['6083dd420436cceb117bbe87','60b23fe3ca812e40e9afd876']}
		 , { from: '60740882c2b047ea7ba4f7e7', end: '6083dd420436cceb117bbe87', no_transfer_to_from_if_full: ['6083dd420436cceb117bbe87','60b23fe3ca812e40e9afd876']}
		 // W21S23
		 , { from: '6094366eddd0210b62066f39', to: '607c8e1c7180d07754def934'}
		 , { from: '607c7411438aa8cb0ea6cf98', to: '607c8e1c7180d07754def934'}
		 , { from: '607c7172bb148fb0417856c9', to: '607c8e1c7180d07754def934'}
		 , { from: '609464ce659f87100377df53', to: '607c8e1c7180d07754def934'}
		 , { from: '609464ce659f87100377df53', to: '608899dcc31e8d4b042866bc'}
		 , { from: '607c7411438aa8cb0ea6cf98', to: '608899dcc31e8d4b042866bc'}
		 , { from: '607c7172bb148fb0417856c9', to: '608899dcc31e8d4b042866bc'}
		 , { from: '6094366eddd0210b62066f39', to: '608899dcc31e8d4b042866bc'}
		 // W29S29
		 , { from: '5ec2330dce2f77348cbbc2ae', to: '5ec1fb20a882200050a21624'}
		 , { from: '5ec7eef883db9c68a817960e', to: '5ec1fb20a882200050a21624'}
		 , { from: '5ed7b1004ac3afa92b4f7ab5', to: '5ec1fb20a882200050a21624'}
		 , { from: '5f1a87f5cf16123a66582ae0', to: '5ec1fb20a882200050a21624'}
		 , { from: '5f1b1a27a6832536693fffd6', to: '5ec1fb20a882200050a21624'}
		 , { from: '60df383ba26a92461287f187', to: '5ec1fb20a882200050a21624'}
		 , { from: '5f1b1a27a6832536693fffd6', to: '60df383ba26a92461287f187', harvest_from_to_if_full: ['5ec1fb20a882200050a21624']}
		 , { from: '5ec7eef883db9c68a817960e', to: '60df383ba26a92461287f187', harvest_from_to_if_full: ['5ec1fb20a882200050a21624']}
		 , { from: '5ed7b1004ac3afa92b4f7ab5', to: '60df383ba26a92461287f187', harvest_from_to_if_full: ['5ec1fb20a882200050a21624']}
     // W28S29
     , { from: '5ec8e23e1d709fc4992a1bc9', to: '60e01bdd2f1a91c35d561852'}
     , { from: '5ece83d23359265d2b9f12e1', to: '60e01bdd2f1a91c35d561852'}
     , { from: '5f2a5ea447f60c98f6ce341b', to: '60e01bdd2f1a91c35d561852'}
     , { from: '5f2a5af80f0a8b02130a866d', to: '60e01bdd2f1a91c35d561852'}
		 , { from: '5f2a5af80f0a8b02130a866d', to: '5ee4ea3abeab12e9af315313'}
		 , { from: '5ec8e23e1d709fc4992a1bc9', to: '5ee4ea3abeab12e9af315313'}
     , { from: '5ece83d23359265d2b9f12e1', to: '5ee4ea3abeab12e9af315313'}
     , { from: '5f2a5ea447f60c98f6ce341b', to: '5ee4ea3abeab12e9af315313'}
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
		if(link_weight >= tools.getWeight(creep.name))
			return undefined;

		const link = cash.getLinks(creep.room)
		 									.filter((l) => 	!!l &&
						 													!!l.store &&
						 													l.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
						 													tools.checkTarget(executer,l.id) &&
						 													creep.pos.inRangeTo(l, 7) &&
																			!!links.links.find((e) => e.from == l.id &&
																		 														(!e.no_transfer_to_from_if_full ||
																			 														e.no_transfer_to_from_if_full
																																		.map((id) => Game.getObjectById(id))
																																		.filter((obj) => !!obj && !!obj.store)
																																		.filter((obj) => obj.store.getFreeCapacity(RESOURCE_ENERGY) > 100 )
																																		.length > 0)))
			 								.sort((l,r) => 	creep.pos.getRangeTo(l) - creep.pos.getRangeTo(r))
											.shift();
		if(!link)
			return undefined;
		
		return (!executer)? link:tools.setTarget(creep,link,link.id,role_run);
	 },

	 getTargetLinkToHarvest: function(creep, executer) {
		 return cash.getLinks(creep.room)
			 					.filter( (l) => !!l &&
					 											!!l.store &&
					 											l.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
				 												tools.checkTarget(executer,l.id) &&
				 												!!links.links.find((e) => e.to == l.id &&
																	 												(!e.harvest_from_to_if_full ||
																		 												e.harvest_from_to_if_full
																															.map((id) => Game.getObjectById(id))
																															.filter((obj) => !!obj && !!obj.store)
																															.filter((obj) => obj.store.getFreeCapacity(RESOURCE_ENERGY) > 100 )
																															.length == 0)))
			 					.sort((l,r) => 	creep.pos.getRangeTo(l) * l.store.getFreeCapacity(RESOURCE_ENERGY)
															 	-
															 	creep.pos.getRangeTo(r) * r.store.getFreeCapacity(RESOURCE_ENERGY))
		 						.shift();
	 },

	 getTargetEndLinkToHarvest: function(creep) {
		 return cash.getLinks(creep.room)
		 						.filter((l) => 	!!l &&
																!!l.store &&
																l.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
																!!links.links.find((e) => e.end == l.id))
			 					.sort((l,r) => 	creep.pos.getRangeTo(l) * l.store.getFreeCapacity(RESOURCE_ENERGY)
															 	-
															 	creep.pos.getRangeTo(r) * r.store.getFreeCapacity(RESOURCE_ENERGY))
		 						.shift();
	 },

   run: function() {
		 links.links
			 			.map((e) => 		( e.from_obj = Game.getObjectById(e.from)
														, e.to_obj = (!!e.end)? Game.getObjectById(e.end):Game.getObjectById(e.to)
														, e))
		 				.filter((e) => 	!!e.from_obj && !!e.from_obj.store &&
														!!e.to_obj && !!e.to_obj.store &&
														e.from_obj.store.getUsedCapacity(RESOURCE_ENERGY) > 0 &&
									 					e.to_obj.store.getFreeCapacity(RESOURCE_ENERGY) > 100)
						.sort((l,r) =>  l.from_obj.store.getFreeCapacity(RESOURCE_ENERGY) * l.to_obj.store.getUsedCapacity(RESOURCE_ENERGY)
														-
														r.from_obj.store.getFreeCapacity(RESOURCE_ENERGY) * r.to_obj.store.getUsedCapacity(RESOURCE_ENERGY))
			 			.map((e) => 		e.from_obj.transferEnergy(e.to_obj));
	 }
};

module.exports = links;
