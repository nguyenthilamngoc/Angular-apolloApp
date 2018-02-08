import {Component, Input, OnInit, OnDestroy} from '@angular/core';
import {Link} from '../types';
import {Subscription} from 'rxjs/Subscription';
import {timeDifferenceForDate} from '../utils';
import {Apollo } from 'apollo-angular';
import {DataProxy} from 'apollo-cache';
import {FetchResult } from 'apollo-link';
import {GC_USER_ID} from '../constant';
import { ALL_LINKS_QUERY, CREATE_VOTE_MUTATION } from '../graphql'

@Component({
  selector: 'hn-link-item',
  templateUrl: './link-item.component.html',
  styleUrls: ['./link-item.component.css']
})
// ...

export class LinkItemComponent implements OnInit, OnDestroy {
  @Input()
  link: Link;

  @Input()
  index: number = 0;

  @Input()
  isAuthenticated: boolean = false;

  //@Input()
  //updateStoreAfterVote: UpdateStoreAfterVoteCallback;

  subscriptions: Subscription[] = [];

  constructor(private apollo: Apollo) {
  }

  ngOnInit() {
  }

  humanizeDate(date: string) {
    return timeDifferenceForDate(date);
  }

  ngOnDestroy(): void {
    for (let sub of this.subscriptions) {
      if (sub && sub.unsubscribe) {
        sub.unsubscribe();
      }
    }
  }
  voteForLink() {
    const userId = localStorage.getItem(GC_USER_ID);
    const voterIds = this.link.votes.map(vote => vote.user.id);
    if (voterIds.includes(userId)) {
      alert(`User (${userId}) already voted for this link.`);
      return
    }
    const linkId = this.link.id;

    const mutationSubscription = this.apollo.mutate({
      mutation: CREATE_VOTE_MUTATION,
      variables: {
        userId,
        linkId
      },
      update: (store, { data: { createVote } }) => {
        this.updateStoreAfterVote(store, createVote, linkId)
      }
    })
      .subscribe();


    this.subscriptions = [...this.subscriptions, mutationSubscription];
  }
  
    updateStoreAfterVote (store, createVote, linkId) {
    // 1
    const data = store.readQuery({
      query: ALL_LINKS_QUERY
    });

    // 2
    const votedLink = data.allLinks.find(link => link.id === linkId);
    votedLink.votes = createVote.link.votes;

    // 3
    store.writeQuery({ query: ALL_LINKS_QUERY, data })
  }
}

// interface UpdateStoreAfterVoteCallback {
//   (proxy: DataProxy, mutationResult: FetchResult, linkId: string);
// }