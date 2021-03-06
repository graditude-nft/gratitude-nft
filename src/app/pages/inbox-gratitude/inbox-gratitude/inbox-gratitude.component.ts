import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { DappInjectorService, Web3Actions, web3Selectors } from 'angular-web3';
import { Contract } from 'ethers';
import { IGRATITUDE_NFT } from 'src/app/shared/models/general';
import { IpfsService } from '../../ipfs/ipfs-service';

@Component({
  selector: 'inbox-gratitude',
  templateUrl: './inbox-gratitude.component.html',
  styleUrls: ['./inbox-gratitude.component.scss']
})
export class InboxGratitudeComponent implements AfterViewInit {
  gratitudeContract: Contract;
  gratitudeToken:IGRATITUDE_NFT;
  linkCode: string;
  blockchain_status: string;
  constructor(private dappInjectorService:DappInjectorService,
    private router: Router,
    private store:Store,
    private ipfsService:IpfsService,
    private route: ActivatedRoute) {
     
     }
 


    async getToken() {
      const nft = await this.gratitudeContract.getGratitudeNFtByLinkCode(this.linkCode)
      console.log(nft)
      const status = nft.status;
      const tokenUri = nft.tokenUri.replace('https://ipfs.io/ipfs/','');;
      const tokenId = nft.tokenId

      await this.ipfsService.init()
      const ipfs_json = await this.ipfsService.getFileJSON(tokenUri)
      console.log(ipfs_json)

      this.gratitudeToken =  {...ipfs_json,...{ status,tokenId}} as IGRATITUDE_NFT;
      console.log(this.gratitudeToken)

    }
 
 
    ngAfterViewInit(): void {

      this.store.select(web3Selectors.chainStatus).subscribe(async (value) => {
        this.blockchain_status = value;
  
      
  
        if (value == 'success') {
          this.store.dispatch(Web3Actions.chainBusy({ status: true}));
          this.linkCode = this.route.snapshot.params['linkCode'];
          console.log(this.route.snapshot.params)
          this.gratitudeContract =  this.dappInjectorService.config.contracts['myContract'].contract
          if (this.linkCode) {
              this.getToken()
          } else {
           this.router.navigateByUrl('/master')
          }
        } else {
  
        }
  
      });

  

  }


}
