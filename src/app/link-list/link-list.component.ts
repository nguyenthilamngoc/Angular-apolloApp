import {Component, OnInit, OnDestroy} from '@angular/core';
import {Apollo, QueryRef } from 'apollo-angular';
import {Link} from '../types';
import {Subscription} from 'rxjs/Subscription';
import {AuthService} from '../auth.service'
// 1
import {ALL_LINKS_QUERY, AllLinkQueryResponse, NEW_LINKS_SUBSCRIPTION, NewLinkSubcriptionResponse} from '../graphql';
import { from } from 'rxjs/observable/from';

@Component({
  selector: 'hn-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.css']
})
export class LinkListComponent implements OnInit, OnDestroy {
  allLinks: Link[] = [];
  loading: boolean = true;

  logged: boolean = false;

  subscriptions: Subscription[] = [];


  constructor(private apollo: Apollo, private authService: AuthService) {
  }

  ngOnInit() {

    this.authService.isAuthenticated
      .distinctUntilChanged()
      .subscribe(isAuthenticated => {
        this.logged = isAuthenticated
      });

    const allLinkQuery: QueryRef<any, any> = this.apollo.watchQuery({
      query: ALL_LINKS_QUERY
    });
    
    allLinkQuery
      .subscribeToMore({
        document: NEW_LINKS_SUBSCRIPTION,
        updateQuery: (previous : AllLinkQueryResponse, { subscriptionData }) => {
          const newAllLinks = [
            subscriptionData.data.Link.node,
            ...previous.allLinks
          ];
          return {
            ...previous,
            allLinks: newAllLinks
          }
        }
      });
    const querySubscription = allLinkQuery.valueChanges.subscribe((response) => {
      this.allLinks = response.data.allLinks;
      this.loading = response.data.loading;
    });

    this.subscriptions = [...this.subscriptions, querySubscription];

  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }


    
}
