import {Component, OnInit, OnDestroy} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {Link} from '../types';
import {Subscription} from 'rxjs/Subscription';
import {AuthService} from '../auth.service'
// 1
import {ALL_LINKS_QUERY, AllLinkQueryResponse} from '../graphql';
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

    const querySubscription = this.apollo.watchQuery({
      query: ALL_LINKS_QUERY
    }).valueChanges.subscribe((response) => {
      let responseData = response.data as AllLinkQueryResponse;
      this.allLinks = responseData.allLinks;
      this.loading = responseData.loading;
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
