import { Component, OnInit, OnDestroy } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Link } from '../types';
import { Subscription } from 'rxjs/Subscription';
import { AuthService } from '../auth.service';
import { LINKS_PER_PAGE } from '../constant';
import { ActivatedRoute, ParamMap, UrlSegment } from '@angular/router';

// 1
import {
  ALL_LINKS_QUERY,
  AllLinkQueryResponse,
  NEW_LINKS_SUBSCRIPTION,
  NewLinkSubcriptionResponse,
  NEW_VOTES_SUBSCRIPTION,
  FEED_QUERY
} from '../graphql';
import { from } from 'rxjs/observable/from';

@Component({
  selector: 'hn-link-list',
  templateUrl: './link-list.component.html',
  styleUrls: ['./link-list.component.css'],
})
export class LinkListComponent implements OnInit, OnDestroy {
  allLinks: Link[] = [];
  loading: boolean = true;

  logged: boolean = false;
  page:number = 0;

  subscriptions: Subscription[] = [];
  pageParam$ :any;

  constructor(private apollo: Apollo, private authService: AuthService, private route:ActivatedRoute) {}

  ngOnInit() {
    this.authService.isAuthenticated
      .distinctUntilChanged()
      .subscribe(isAuthenticated => {
        this.logged = isAuthenticated;
      });

      // this.pageParam$ = this.route.paramMap
      // .switchMap((params: ParamMap) => 
      //   // (+) before `params.get()` turns the string into a number
      //    params.get('page')
      // );
      this.page = +this.route.snapshot.paramMap.get('page');

      const urlSegments :UrlSegment = this.route.snapshot.url.find(x=>x.path=='new');
      const isNewPage = urlSegments!=null;
      const skip = isNewPage ? (this.page - 1) * LINKS_PER_PAGE : 0
      const first = isNewPage ? LINKS_PER_PAGE : 100
      const orderBy = isNewPage ? 'createdAt_DESC' : null

    // const allLinkQuery: QueryRef<any, any> = this.apollo.watchQuery({
    //   query: ALL_LINKS_QUERY,
    // });
    const allLinkQuery: QueryRef<any, any> = this.apollo.watchQuery<any>({
      query: FEED_QUERY,
      variables: {
        first: first,
        skip: skip,
        orderBy: orderBy
      }
    });

    allLinkQuery.subscribeToMore({
      document: NEW_LINKS_SUBSCRIPTION,
      updateQuery: (previous: AllLinkQueryResponse, { subscriptionData }) => {
        const newAllLinks = [
          subscriptionData.data.Link.node,
          ...previous.allLinks,
        ];
        return {
          ...previous,
          allLinks: newAllLinks,
        };
      },
    });
    allLinkQuery.subscribeToMore({
      document: NEW_VOTES_SUBSCRIPTION,
      updateQuery: (previous: AllLinkQueryResponse, { subscriptionData }) => {
        const votedLinkIndex = previous.allLinks.findIndex(
          link => link.id === subscriptionData.data.Vote.node.link.id
        );

        const newAllLinks = [...previous.allLinks];
        newAllLinks[votedLinkIndex] = subscriptionData.data.Vote.node.link;

        return {
          ...previous,
          allLinks: newAllLinks,
        };
      },
    });

    const querySubscription = allLinkQuery.valueChanges.subscribe(response => {
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
