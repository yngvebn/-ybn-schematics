import { <%= classify(name) %>Component } from './<%= dasherize(name) %>.component';

describe('<%= classify(name) %>Component', () => {
  let component: <%= classify(name) %>Component;

  beforeEach(() => {
    component = new <%= classify(name) %>Component();
   });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
